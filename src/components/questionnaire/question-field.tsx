"use client"

import { Info } from "lucide-react"

import { useLanguage } from "@/components/i18n/language-provider"
import { ColorField } from "@/components/questionnaire/color-field"
import { FileField } from "@/components/questionnaire/file-field"
import { RepeaterField } from "@/components/questionnaire/repeater-field"
import { ToggleField } from "@/components/questionnaire/toggle-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { t } from "@/lib/i18n"
import { resolveChoices } from "@/lib/questionnaire/choices"
import type { Question } from "@/lib/questionnaire/questions"
import type {
  AnswerMap,
  AnswerValue,
  FileAnswer,
  RepeaterRow,
} from "@/lib/supabase/types"

type Props = {
  question: Question
  answers: AnswerMap
  value: AnswerValue
  optedOut: boolean
  userId: string
  error?: string
  onChange: (value: AnswerValue) => void
  onOptOutChange: (checked: boolean) => void
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {children}
      </span>
      <span className="bg-border h-px flex-1" />
    </div>
  )
}

export function QuestionField({
  question,
  answers,
  value,
  optedOut,
  userId,
  error,
  onChange,
  onOptOutChange,
}: Props) {
  const { lang, tr } = useLanguage()

  const describedBy =
    [
      question.help ? `${question.id}-help` : null,
      error ? `${question.id}-error` : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined

  // A consent box is its own thing: the label sits beside the checkbox rather
  // than above a control.
  if (question.type === "consent") {
    return (
      <div className="space-y-2" data-question={question.id}>
        {question.groupTitle && (
          <GroupTitle>{t(question.groupTitle, lang)}</GroupTitle>
        )}
        <div className="flex items-start gap-2.5">
          <Checkbox
            id={question.id}
            className="mt-0.5"
            checked={value === true}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${question.id}-error` : undefined}
            onCheckedChange={(checked) => onChange(checked === true)}
          />
          <div className="space-y-1">
            <Label htmlFor={question.id} className="font-normal leading-snug">
              <span>{t(question.label, lang)}</span>
              {question.required && (
                <span className="text-muted-foreground" aria-label={tr("required")}>
                  *
                </span>
              )}
            </Label>
            {question.linkUrl && question.linkLabel && (
              <a
                href={question.linkUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-foreground block text-xs underline underline-offset-4"
              >
                {t(question.linkLabel, lang)}
              </a>
            )}
          </div>
        </div>

        {error && (
          <p
            id={`${question.id}-error`}
            className="text-destructive text-xs"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2.5" data-question={question.id}>
      {question.groupTitle && (
        <GroupTitle>{t(question.groupTitle, lang)}</GroupTitle>
      )}

      <Label htmlFor={question.id} className="items-start gap-1.5">
        <span className="leading-snug">{t(question.label, lang)}</span>
        {question.required ? (
          <span className="text-muted-foreground" aria-label={tr("required")}>
            *
          </span>
        ) : (
          <span className="text-muted-foreground text-xs font-normal">
            {tr("optional")}
          </span>
        )}
      </Label>

      {question.help && (
        <p id={`${question.id}-help`} className="text-muted-foreground text-xs">
          {t(question.help, lang)}
        </p>
      )}

      <div className={optedOut ? "pointer-events-none opacity-50" : undefined}>
        <Control
          question={question}
          answers={answers}
          value={value}
          userId={userId}
          invalid={Boolean(error)}
          describedBy={describedBy}
          onChange={onChange}
        />
      </div>

      {question.optOut && (
        <div className="mt-1 flex items-center gap-2.5 border-t pt-3">
          <Checkbox
            id={question.optOut.id}
            checked={optedOut}
            onCheckedChange={(checked) => onOptOutChange(checked === true)}
          />
          <Label htmlFor={question.optOut.id} className="font-normal">
            {t(question.optOut.label, lang)}
          </Label>
        </div>
      )}

      {question.note && (
        <p className="bg-muted/50 text-muted-foreground flex items-start gap-2 rounded-md px-3 py-2 text-xs">
          <Info className="mt-px size-3.5 shrink-0" />
          {t(question.note, lang)}
        </p>
      )}

      {error && (
        <p
          id={`${question.id}-error`}
          className="text-destructive text-xs"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

function Control({
  question,
  answers,
  value,
  userId,
  invalid,
  describedBy,
  onChange,
}: {
  question: Question
  answers: AnswerMap
  value: AnswerValue
  userId: string
  invalid: boolean
  describedBy?: string
  onChange: (value: AnswerValue) => void
}) {
  const { lang, tr } = useLanguage()

  const shared = {
    id: question.id,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
  }

  switch (question.type) {
    case "textarea":
      return (
        <Textarea
          {...shared}
          rows={4}
          placeholder={t(question.placeholder, lang)}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case "number":
      return (
        <Input
          {...shared}
          type="number"
          inputMode="numeric"
          className="max-w-40"
          min={question.min}
          max={question.max}
          placeholder={t(question.placeholder, lang)}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
        />
      )

    case "date":
      return (
        <Input
          {...shared}
          type="date"
          className="max-w-52"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case "toggle":
      return (
        <ToggleField
          id={question.id}
          value={typeof value === "boolean" ? value : null}
          invalid={invalid}
          describedBy={describedBy}
          onChange={onChange}
        />
      )

    case "color":
      return (
        <ColorField
          id={question.id}
          values={Array.isArray(value) ? (value as string[]) : []}
          multiple={question.multiple}
          invalid={invalid}
          describedBy={describedBy}
          onChange={onChange}
        />
      )

    case "file":
      return (
        <FileField
          id={question.id}
          userId={userId}
          value={
            value && typeof value === "object" && "kind" in value
              ? (value as FileAnswer)
              : null
          }
          invalid={invalid}
          describedBy={describedBy}
          onChange={onChange}
        />
      )

    case "repeater":
      return (
        <RepeaterField
          id={question.id}
          fields={question.fields ?? []}
          answers={answers}
          addLabel={t(question.addLabel, lang)}
          rows={Array.isArray(value) ? (value as RepeaterRow[]) : []}
          onChange={onChange}
        />
      )

    case "radio":
      return (
        <RadioGroup
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
          className="pt-1"
        >
          {resolveChoices(question, answers, lang).map((choice) => (
            <div key={choice.value} className="flex items-center gap-2.5">
              <RadioGroupItem
                id={`${question.id}-${choice.value}`}
                value={choice.value}
              />
              <Label
                htmlFor={`${question.id}-${choice.value}`}
                className="font-normal"
              >
                {choice.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )

    case "checkbox": {
      const selected = Array.isArray(value) ? (value as string[]) : []
      return (
        <div
          className="grid gap-3 pt-1 sm:grid-cols-2"
          role="group"
          aria-describedby={describedBy}
        >
          {resolveChoices(question, answers, lang).map((choice) => (
            <div key={choice.value} className="flex items-center gap-2.5">
              <Checkbox
                id={`${question.id}-${choice.value}`}
                checked={selected.includes(choice.value)}
                onCheckedChange={(checked) =>
                  onChange(
                    checked
                      ? [...selected, choice.value]
                      : selected.filter((v) => v !== choice.value)
                  )
                }
              />
              <Label
                htmlFor={`${question.id}-${choice.value}`}
                className="font-normal"
              >
                {choice.label}
              </Label>
            </div>
          ))}
        </div>
      )
    }

    case "select":
      return (
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
        >
          <SelectTrigger
            id={question.id}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          >
            <SelectValue placeholder={tr("choose")} />
          </SelectTrigger>
          <SelectContent>
            {resolveChoices(question, answers, lang).map((choice) => (
              <SelectItem key={choice.value} value={choice.value}>
                {choice.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    default:
      return (
        <Input
          {...shared}
          type={
            question.type === "email"
              ? "email"
              : question.type === "url"
                ? "url"
                : question.type === "tel"
                  ? "tel"
                  : "text"
          }
          inputMode={question.type === "tel" ? "tel" : undefined}
          // URL fields otherwise get the current page suggested as an autofill.
          autoComplete={question.type === "url" ? "off" : undefined}
          placeholder={t(question.placeholder, lang)}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}
