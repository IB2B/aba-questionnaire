"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"

import { saveDraft, submitResponse } from "@/app/questionnaire/actions"
import { useLanguage } from "@/components/i18n/language-provider"
import { AnswerSummary } from "@/components/questionnaire/answer-summary"
import { QuestionField } from "@/components/questionnaire/question-field"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { t } from "@/lib/i18n"
import { SECTIONS } from "@/lib/questionnaire/questions"
import {
  firstInvalidSection,
  isOptedOut,
  stepPercent,
  validateSection,
  normalizeAnswers,
  visibleQuestions,
  type Errors,
} from "@/lib/questionnaire/validation"
import type { AnswerMap, AnswerValue } from "@/lib/supabase/types"

const AUTOSAVE_DELAY_MS = 1200
const REVIEW_STEP = SECTIONS.length
const TOTAL_STEPS = SECTIONS.length + 1

export function QuestionnaireForm({
  initialAnswers,
  userId,
}: {
  initialAnswers: AnswerMap
  userId: string
}) {
  const router = useRouter()
  const { lang, tr } = useLanguage()

  // Saved progress may predate a question being added or retired, so it is
  // pruned and re-defaulted before it reaches the fields.
  const [answers, setAnswers] = React.useState<AnswerMap>(() =>
    normalizeAnswers(initialAnswers)
  )
  const [step, setStep] = React.useState(0)
  const [errors, setErrors] = React.useState<Errors>({})
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved">(
    "idle"
  )
  const [submitting, setSubmitting] = React.useState(false)

  const onReview = step === REVIEW_STEP
  const section = onReview ? null : SECTIONS[step]
  const percent = stepPercent(step, TOTAL_STEPS)
  const errorCount = Object.keys(errors).length

  // Autosave the draft shortly after the client stops typing.
  const dirty = React.useRef(false)
  React.useEffect(() => {
    if (!dirty.current) return
    setSaveState("saving")
    const timer = setTimeout(async () => {
      const result = await saveDraft(answers, lang)
      setSaveState(result.ok ? "saved" : "idle")
      if (result.locked) {
        // Submitted in another tab — swap to the confirmation screen.
        toast.error(result.error)
        router.refresh()
      } else if (!result.ok) {
        toast.error(tr("saveFailed"))
      }
    }, AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [answers, lang, router, tr])

  function update(id: string, value: AnswerValue) {
    dirty.current = true
    setAnswers((prev) => ({ ...prev, [id]: value }))
    // Clear this field's error as soon as it is touched.
    setErrors((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  /** Put the cursor on the first field that failed, so the fix is obvious. */
  function focusFirstError(sectionErrors: Errors) {
    const firstId = Object.keys(sectionErrors)[0]
    if (!firstId) return

    requestAnimationFrame(() => {
      const block = document.querySelector<HTMLElement>(
        `[data-question="${firstId}"]`
      )
      block?.scrollIntoView({ behavior: "smooth", block: "center" })

      const field = document.getElementById(firstId)
      // Radio groups and toggles are divs — focusing them would steal the
      // scroll, so only real inputs get the cursor.
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement
      ) {
        field.focus({ preventScroll: true })
      }
    })
  }

  function goTo(nextStep: number) {
    setStep(nextStep)
    setErrors({})
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Steps are free to move between — nothing is checked until Submit, so the
  // client can skip ahead, come back, and fill things in whatever order suits
  // them. Everything is validated in one pass at the end.
  function handleNext() {
    goTo(step + 1)
  }

  async function handleSubmit() {
    const invalid = firstInvalidSection(answers, lang)
    if (invalid !== -1) {
      const sectionErrors = validateSection(SECTIONS[invalid], answers, lang)
      setStep(invalid)
      setErrors(sectionErrors)
      toast.error(
        tr("missingInSection", { section: t(SECTIONS[invalid].title, lang) })
      )
      focusFirstError(sectionErrors)
      return
    }

    setSubmitting(true)
    const result = await submitResponse(answers, lang)
    setSubmitting(false)

    if (!result.ok) {
      toast.error(result.error ?? tr("submitFailed"))
      if (result.locked) router.refresh()
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            {tr("stepOf", { current: step + 1, total: TOTAL_STEPS })}
          </span>
          <span aria-live="polite">
            {saveState === "saving"
              ? tr("saving")
              : saveState === "saved"
                ? tr("saved")
                : `${percent}%`}
          </span>
        </div>
        <Progress value={percent} aria-label={tr("stepOf", {
          current: step + 1,
          total: TOTAL_STEPS,
        })} />
      </div>

      {onReview ? (
        <>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {tr("reviewTitle")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {tr("reviewIntro")}
            </p>
          </div>

          <div className="space-y-1">
            {SECTIONS.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm font-medium">{t(s.title, lang)}</span>
                <Button variant="ghost" size="sm" onClick={() => goTo(i)}>
                  <Pencil className="size-3.5" />
                  {tr("edit")}
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t pt-8">
            <AnswerSummary answers={answers} lang={lang} />
          </div>
        </>
      ) : (
        section && (
          <>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {t(section.title, lang)}
              </h1>
              {section.description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {t(section.description, lang)}
                </p>
              )}
            </div>

            <div className="space-y-7">
              {visibleQuestions(section, answers).map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  answers={answers}
                  userId={userId}
                  value={answers[question.id] ?? null}
                  optedOut={isOptedOut(question, answers)}
                  error={errors[question.id]}
                  onChange={(value) => update(question.id, value)}
                  onOptOutChange={(checked) =>
                    question.optOut && update(question.optOut.id, checked)
                  }
                />
              ))}
            </div>
          </>
        )
      )}

      {errorCount > 0 && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 text-destructive flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm"
        >
          <AlertCircle className="size-4 shrink-0" />
          {tr("fillRequired")}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t pt-6">
        <Button
          variant="ghost"
          onClick={() => goTo(step - 1)}
          disabled={step === 0 || submitting}
        >
          <ArrowLeft />
          {tr("back")}
        </Button>

        {onReview ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <Check />}
            {tr("submit")}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {step === SECTIONS.length - 1 ? tr("review") : tr("next")}
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  )
}
