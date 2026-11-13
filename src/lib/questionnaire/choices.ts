import { t, type Lang } from "@/lib/i18n"
import {
  questionById,
  type Choice,
  type ChoiceSource,
} from "@/lib/questionnaire/questions"
import type { AnswerMap, RepeaterRow } from "@/lib/supabase/types"

/** A choice with its label already resolved into one language. */
export type ResolvedChoice = { value: string; label: string }

type ChoiceSpec = { choices?: Choice[]; choicesFrom?: ChoiceSource[] }

/**
 * The options to show for a dropdown, including any pulled from earlier
 * answers — "snapshot predefinito" is built from the snapshots or niches the
 * client listed a few questions earlier.
 */
export function resolveChoices(
  spec: ChoiceSpec,
  answers: AnswerMap,
  lang: Lang
): ResolvedChoice[] {
  const out: ResolvedChoice[] = []
  const seen = new Set<string>()

  const push = (value: string, label: string) => {
    const key = value.toLowerCase()
    if (!value || seen.has(key)) return
    seen.add(key)
    out.push({ value, label })
  }

  for (const choice of spec.choices ?? []) {
    push(choice.value, t(choice.label, lang))
  }

  for (const source of spec.choicesFrom ?? []) {
    const value = answers[source.questionId]
    if (!Array.isArray(value)) continue

    for (const item of value) {
      // A checkbox answer — reuse the source question's own labels.
      if (typeof item === "string") {
        const origin = questionById(source.questionId)
        const label = origin?.choices?.find((c) => c.value === item)?.label
        push(item, label ? t(label, lang) : item)
        continue
      }

      // A repeater row — use the named column as both value and label.
      if (item && typeof item === "object") {
        const row = item as RepeaterRow
        const cell = source.field ? row[source.field] : Object.values(row)[0]
        if (typeof cell === "string" && cell.trim()) {
          push(cell.trim(), cell.trim())
        }
      }
    }
  }

  return out
}

/** The display label for a stored value, dynamic options included. */
export function labelForValue(
  spec: ChoiceSpec,
  value: string,
  answers: AnswerMap,
  lang: Lang
): string {
  return (
    resolveChoices(spec, answers, lang).find((c) => c.value === value)?.label ??
    value
  )
}
