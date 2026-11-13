import { DEFAULT_LANG, t as tr, ui, type Lang } from "@/lib/i18n"
import { labelForValue } from "@/lib/questionnaire/choices"
import { SECTIONS, type Question } from "@/lib/questionnaire/questions"
import { isBlank, isOptedOut, isVisible } from "@/lib/questionnaire/validation"
import type { AnswerMap, AnswerValue, RepeaterRow } from "@/lib/supabase/types"

/**
 * Submission notifications, sent through Resend, in the language the client
 * filled the form in.
 *
 * Everything is configurable by environment variable:
 *   RESEND_API_KEY    — from resend.com/api-keys
 *   NOTIFY_EMAIL_TO   — who gets the summary (comma-separate for several)
 *   NOTIFY_EMAIL_FROM — a verified sender on your Resend domain
 *
 * With no API key the app simply skips the email — submitting still works and
 * the answers are safe in the database either way.
 */

function formatValue(
  question: Question,
  value: AnswerValue,
  answers: AnswerMap,
  lang: Lang
): string {
  const labelFor = (v: string) => labelForValue(question, v, answers, lang)

  if (question.type === "toggle" || question.type === "consent") {
    if (typeof value !== "boolean") return "—"
    return value ? ui("yes", lang) : ui("no", lang)
  }

  if (isBlank(value)) return "—"

  if (question.type === "file") {
    if (typeof value === "object" && value !== null && "kind" in value) {
      return value.kind === "link" ? value.url : `${value.name} (upload)`
    }
    return "—"
  }

  if (question.type === "repeater") {
    const rows = Array.isArray(value) ? (value as RepeaterRow[]) : []
    const filled = rows.filter((r) =>
      Object.values(r).some((v) => v && v.trim() !== "")
    )
    if (filled.length === 0) return "—"

    return filled
      .map((row, i) => {
        const cells = (question.fields ?? [])
          .map((f) =>
            row[f.id]
              ? `${tr(f.label, lang)}: ${labelForValue(f, row[f.id], answers, lang)}`
              : null
          )
          .filter(Boolean)
          .join(" · ")
        return `  ${i + 1}. ${cells}`
      })
      .join("\n")
  }

  if (Array.isArray(value)) {
    return (value as string[]).map(labelFor).join(", ")
  }
  if ((question.choices || question.choicesFrom) && typeof value === "string") {
    return labelFor(value)
  }
  return String(value)
}

/** One question rendered as "Label: value", in the client's language. */
function lineFor(q: Question, answers: AnswerMap, lang: Lang) {
  const label = tr(q.label, lang)
  const value = isOptedOut(q, answers)
    ? tr(q.optOut!.label, lang)
    : formatValue(q, answers[q.id] ?? null, answers, lang)
  return { label, value }
}

/** A readable plain-text version of the whole response. */
export function renderSummaryText(answers: AnswerMap, lang: Lang): string {
  const blocks = SECTIONS.map((section) => {
    const lines = section.questions
      .filter((q) => isVisible(q, answers))
      .map((q) => {
        const { label, value } = lineFor(q, answers, lang)
        return value.includes("\n")
          ? `${label}:\n${value}`
          : `${label}: ${value}`
      })

    const title = tr(section.title, lang).toUpperCase()
    return `${title}\n${"-".repeat(title.length)}\n${lines.join("\n")}`
  })

  return blocks.join("\n\n")
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function renderSummaryHtml(
  answers: AnswerMap,
  heading: string,
  lang: Lang
): string {
  const sections = SECTIONS.map((section) => {
    const rows = section.questions
      .filter((q) => isVisible(q, answers))
      .map((q) => {
        const { label, value } = lineFor(q, answers, lang)
        return `<tr>
          <td style="padding:6px 12px 6px 0;color:#71717a;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
          <td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td>
        </tr>`
      })
      .join("")

    return `<h2 style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#71717a;margin:28px 0 8px">${escapeHtml(tr(section.title, lang))}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>`
  }).join("")

  return `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#18181b">
    <h1 style="font-size:18px;margin:0 0 4px">${escapeHtml(heading)}</h1>
    ${sections}
  </div>`
}

export async function sendSubmissionEmail({
  answers,
  clientEmail,
  clientName,
  lang = DEFAULT_LANG,
}: {
  answers: AnswerMap
  clientEmail: string
  clientName: string | null
  lang?: Lang
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const to = (process.env.NOTIFY_EMAIL_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const from = process.env.NOTIFY_EMAIL_FROM

  if (!apiKey || to.length === 0 || !from) {
    return { sent: false, error: "Email is not configured." }
  }

  const who = clientName ? `${clientName} (${clientEmail})` : clientEmail
  const heading = ui("emailSubject", lang, { who })

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: clientEmail,
        subject: heading,
        text: `${heading}\n\n${renderSummaryText(answers, lang)}`,
        html: renderSummaryHtml(answers, heading, lang),
      }),
    })

    if (!response.ok) {
      return { sent: false, error: await response.text() }
    }
    return { sent: true }
  } catch (error) {
    return { sent: false, error: String(error) }
  }
}
