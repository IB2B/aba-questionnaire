import { t, type Lang } from "@/lib/i18n"
import {
  ALL_QUESTIONS,
  SECTIONS,
  questionById,
  type Question,
  type Section,
  type ShowIf,
} from "@/lib/questionnaire/questions"
import {
  VALIDATION,
  isValidCap,
  isValidCodiceFiscale,
  isValidEmail,
  isValidHttpsUrl,
  isValidPartitaIva,
  isValidPhone,
  isValidSdi,
} from "@/lib/questionnaire/validators"
import type {
  AnswerMap,
  AnswerValue,
  RepeaterRow,
} from "@/lib/supabase/types"

export type Errors = Record<string, string>

export function isBlank(value: AnswerValue): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "boolean") return false
  if (typeof value === "object") {
    // A file answer counts as blank until it has a path or a link.
    if ("kind" in value) {
      return value.kind === "upload"
        ? !value.path
        : !value.url || value.url.trim() === ""
    }
  }
  return false
}

/** Has the client ticked this question's "leave it to you" box? */
export function isOptedOut(question: Question, answers: AnswerMap): boolean {
  return Boolean(question.optOut && answers[question.optOut.id] === true)
}

function matchesRule(rule: ShowIf, answers: AnswerMap): boolean {
  const target = answers[rule.questionId]

  if (rule.includes !== undefined) {
    // `includes` only ever points at a checkbox answer, which is string[].
    return Array.isArray(target) && (target as string[]).includes(rule.includes)
  }
  if (rule.equals !== undefined) {
    return target === rule.equals
  }
  return !isBlank(target ?? null)
}

/** Is this question shown, given the answers so far? */
export function isVisible(question: Question, answers: AnswerMap): boolean {
  if (question.showIfAny) {
    return question.showIfAny.some((rule) => matchesRule(rule, answers))
  }
  if (question.showIf) return matchesRule(question.showIf, answers)
  return true
}

/** The questions actually on screen for a section. */
export function visibleQuestions(
  section: Section,
  answers: AnswerMap
): Question[] {
  return section.questions.filter((q) => isVisible(q, answers))
}

export function allVisibleQuestions(answers: AnswerMap): Question[] {
  return SECTIONS.flatMap((s) => visibleQuestions(s, answers))
}

export function validateQuestion(
  question: Question,
  value: AnswerValue,
  answers: AnswerMap,
  lang: Lang
): string | null {
  if (isOptedOut(question, answers)) return null

  const err = (key: keyof typeof VALIDATION) => t(VALIDATION[key], lang)

  // Repeaters carry their own rules, so they are checked before the generic
  // "is it empty" test — an empty row is not the same as an empty answer.
  if (question.type === "repeater") {
    const rows = Array.isArray(value) ? (value as RepeaterRow[]) : []
    const filled = rows.filter((row) =>
      Object.values(row).some((cell) => cell && cell.trim() !== "")
    )

    if (filled.length === 0) {
      return question.required ? err("atLeastOneRow") : null
    }

    const requiredFields = (question.fields ?? []).filter((f) => f.required)
    for (const [index, row] of filled.entries()) {
      const missing = requiredFields.find(
        (f) => !row[f.id] || row[f.id].trim() === ""
      )
      if (missing) {
        return `${index + 1}. ${t(missing.label, lang)} — ${err("required")}`
      }
    }
    return null
  }

  // A consent box is only ever valid when it is actually ticked.
  if (question.type === "consent") {
    if (question.required && value !== true) return err("consent")
    return null
  }

  if (isBlank(value)) {
    return question.required ? err("required") : null
  }

  if (typeof value === "string") {
    const text = value.trim()

    if (question.type === "email" && !isValidEmail(text)) return err("email")
    if (question.type === "tel" && !isValidPhone(text)) return err("phone")
    if (question.type === "url" && !isValidHttpsUrl(text)) return err("https")

    switch (question.format) {
      case "partita_iva":
        if (!isValidPartitaIva(text)) return err("partitaIva")
        break
      case "codice_fiscale":
        if (!isValidCodiceFiscale(text)) return err("codiceFiscale")
        break
      case "cap":
        if (!isValidCap(text)) return err("cap")
        break
      case "sdi":
        if (!isValidSdi(text)) return err("sdi")
        break
    }
  }

  if (question.type === "file" && typeof value === "object" && value !== null) {
    if ("kind" in value && value.kind === "link" && !isValidHttpsUrl(value.url)) {
      return err("https")
    }
  }

  if (question.type === "color" && Array.isArray(value)) {
    const bad = value.find(
      (c) => typeof c !== "string" || !/^#[0-9a-f]{6}$/i.test(c)
    )
    if (bad) return err("hex")
  }

  if (question.type === "number") {
    const n = typeof value === "number" ? value : Number(value)
    if (Number.isNaN(n)) return err("number")
    if (question.min !== undefined && n < question.min) {
      return `${err("number")} ≥ ${question.min}`
    }
    if (question.max !== undefined && n > question.max) {
      return `${err("number")} ≤ ${question.max}`
    }
  }

  return null
}

export function validateSection(
  section: Section,
  answers: AnswerMap,
  lang: Lang
): Errors {
  const errors: Errors = {}
  for (const question of visibleQuestions(section, answers)) {
    const error = validateQuestion(
      question,
      answers[question.id] ?? null,
      answers,
      lang
    )
    if (error) errors[question.id] = error
  }
  return errors
}

export function validateAll(answers: AnswerMap, lang: Lang): Errors {
  return SECTIONS.reduce<Errors>(
    (acc, section) => ({ ...acc, ...validateSection(section, answers, lang) }),
    {}
  )
}

/** The first section index that still has an error, or -1 if all are clean. */
export function firstInvalidSection(answers: AnswerMap, lang: Lang): number {
  return SECTIONS.findIndex(
    (section) => Object.keys(validateSection(section, answers, lang)).length > 0
  )
}

/**
 * Pre-fills questions that declare a `defaultValue`.
 *
 * A default applies when the answer is missing *or* blank, so progress saved
 * before the default existed still picks it up. `false` and `0` are real
 * answers and are left alone.
 */
export function withDefaults(answers: AnswerMap): AnswerMap {
  const next = { ...answers }
  for (const question of ALL_QUESTIONS) {
    if (question.defaultValue === undefined) continue
    const current = next[question.id]
    const missing = current === undefined || current === null || current === ""
    if (missing) next[question.id] = question.defaultValue
  }
  return next
}

/** Every answer key the current questionnaire still uses. */
function liveAnswerKeys(): Set<string> {
  const keys = new Set<string>()
  for (const question of ALL_QUESTIONS) {
    keys.add(question.id)
    if (question.optOut) keys.add(question.optOut.id)
  }
  return keys
}

/**
 * Cleans up a saved answer map:
 *   - drops answers to questions that no longer exist (a retired field keeps
 *     its old value in the database forever otherwise)
 *   - drops repeater rows where every cell is empty
 */
export function pruneAnswers(answers: AnswerMap): AnswerMap {
  const live = liveAnswerKeys()
  const out: AnswerMap = {}

  for (const [id, value] of Object.entries(answers)) {
    if (!live.has(id)) continue

    if (questionById(id)?.type === "repeater" && Array.isArray(value)) {
      out[id] = (value as RepeaterRow[]).filter(
        (row) =>
          row &&
          typeof row === "object" &&
          Object.values(row).some(
            (cell) => typeof cell === "string" && cell.trim() !== ""
          )
      )
      continue
    }

    out[id] = value
  }

  return out
}

/** What the form and the database should both hold: pruned, then defaulted. */
export function normalizeAnswers(answers: AnswerMap): AnswerMap {
  return withDefaults(pruneAnswers(answers))
}

/**
 * How far through the form the client is, by step rather than by field —
 * step 1 of 8 reads as 12%, the last step as 100%.
 */
export function stepPercent(step: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0
  return Math.floor(((step + 1) / totalSteps) * 100)
}

/** Share of visible required questions that have an answer, as 0–100. */
export function completionPercent(answers: AnswerMap): number {
  const required = allVisibleQuestions(answers).filter(
    (q) => q.required && !isOptedOut(q, answers)
  )
  if (required.length === 0) return 100
  const done = required.filter((q) => {
    const value = answers[q.id] ?? null
    return q.type === "consent" ? value === true : !isBlank(value)
  }).length
  return Math.round((done / required.length) * 100)
}
