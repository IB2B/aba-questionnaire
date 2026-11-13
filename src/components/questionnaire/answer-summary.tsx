import { t, ui, type Lang } from "@/lib/i18n"
import { labelForValue } from "@/lib/questionnaire/choices"
import { SECTIONS, type Question } from "@/lib/questionnaire/questions"
import { isBlank, isOptedOut, isVisible } from "@/lib/questionnaire/validation"
import type { AnswerMap, AnswerValue, RepeaterRow } from "@/lib/supabase/types"

/** Signed download links for uploaded files, keyed by question id. */
export type FileUrls = Record<string, string>

export function AnswerSummary({
  answers,
  lang,
  fileUrls = {},
}: {
  answers: AnswerMap
  lang: Lang
  fileUrls?: FileUrls
}) {
  return (
    <div className="space-y-10">
      {SECTIONS.map((section) => {
        const questions = section.questions.filter((q) => isVisible(q, answers))
        if (questions.length === 0) return null

        return (
          <section key={section.id} className="space-y-5">
            <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {t(section.title, lang)}
            </h2>

            <dl className="space-y-5">
              {questions.map((question) => (
                <div key={question.id} className="grid gap-1.5">
                  <dt className="text-sm font-medium">
                    {t(question.label, lang)}
                  </dt>
                  <dd className="text-sm">
                    <AnswerValueView
                      question={question}
                      value={answers[question.id] ?? null}
                      optedOut={isOptedOut(question, answers)}
                      answers={answers}
                      lang={lang}
                      fileUrl={fileUrls[question.id]}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground italic">{children}</span>
}

function AnswerValueView({
  question,
  value,
  optedOut,
  answers,
  lang,
  fileUrl,
}: {
  question: Question
  value: AnswerValue
  optedOut: boolean
  answers: AnswerMap
  lang: Lang
  fileUrl?: string
}) {
  const notAnswered = ui("notAnswered", lang)

  if (optedOut) {
    return <Empty>{t(question.optOut!.label, lang)}</Empty>
  }

  if (question.type === "toggle" || question.type === "consent") {
    if (typeof value !== "boolean") return <Empty>{notAnswered}</Empty>
    return <span>{value ? ui("yes", lang) : ui("no", lang)}</span>
  }

  if (isBlank(value)) return <Empty>{notAnswered}</Empty>

  const labelFor = (v: string) => labelForValue(question, v, answers, lang)

  switch (question.type) {
    case "color": {
      const colors = Array.isArray(value) ? (value as string[]) : []
      return (
        <span className="flex flex-wrap gap-2">
          {colors.map((color, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-md border py-0.5 pr-2 pl-1"
            >
              <span
                className="size-4 rounded-sm border"
                style={{ backgroundColor: color }}
              />
              <span className="font-mono text-xs uppercase">{color}</span>
            </span>
          ))}
        </span>
      )
    }

    case "file": {
      if (typeof value !== "object" || value === null || !("kind" in value)) {
        return <Empty>{notAnswered}</Empty>
      }
      if (value.kind === "link") {
        return (
          <a
            href={value.url}
            target="_blank"
            rel="noreferrer noopener"
            className="break-all underline underline-offset-4"
          >
            {value.url}
          </a>
        )
      }
      return fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-4"
        >
          {value.name}
        </a>
      ) : (
        <span>{value.name}</span>
      )
    }

    case "repeater": {
      const rows = Array.isArray(value) ? (value as RepeaterRow[]) : []
      const filled = rows.filter((row) =>
        Object.values(row).some((v) => v && v.trim() !== "")
      )
      if (filled.length === 0) return <Empty>{ui("none", lang)}</Empty>

      return (
        <ul className="space-y-2">
          {filled.map((row, i) => (
            <li key={i} className="rounded-md border px-3 py-2">
              <dl className="grid gap-1">
                {question.fields?.map((field) => {
                  const cell = row[field.id]
                  if (!cell || cell.trim() === "") return null
                  return (
                    <div key={field.id} className="flex gap-2 text-xs">
                      <dt className="text-muted-foreground shrink-0">
                        {t(field.label, lang)}
                      </dt>
                      <dd className="whitespace-pre-wrap">
                        {labelForValue(field, cell, answers, lang)}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </li>
          ))}
        </ul>
      )
    }

    case "checkbox": {
      const selected = Array.isArray(value) ? (value as string[]) : []
      return <span>{selected.map(labelFor).join(", ")}</span>
    }

    case "date": {
      const date = new Date(String(value))
      return (
        <span>
          {Number.isNaN(date.getTime())
            ? String(value)
            : date.toLocaleDateString(lang === "it" ? "it-IT" : "en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
        </span>
      )
    }

    default:
      if ((question.choices || question.choicesFrom) && typeof value === "string") {
        return <span>{labelFor(value)}</span>
      }
      return <span className="whitespace-pre-wrap">{String(value)}</span>
  }
}
