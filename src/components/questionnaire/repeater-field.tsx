"use client"

import { Plus, Trash2 } from "lucide-react"

import { useLanguage } from "@/components/i18n/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { RepeaterField as Field } from "@/lib/questionnaire/questions"
import type { AnswerMap, RepeaterRow } from "@/lib/supabase/types"

export function RepeaterField({
  id,
  fields,
  rows,
  answers,
  addLabel,
  onChange,
}: {
  id: string
  fields: Field[]
  rows: RepeaterRow[]
  answers: AnswerMap
  addLabel?: string
  onChange: (rows: RepeaterRow[]) => void
}) {
  const { lang, tr } = useLanguage()

  function setCell(index: number, fieldId: string, value: string) {
    const next = rows.map((row, i) =>
      i === index ? { ...row, [fieldId]: value } : row
    )
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="bg-muted/30 space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              #{index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={tr("removeRow", { n: index + 1 })}
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => {
              const fieldId = `${id}-${index}-${field.id}`
              const value = row[field.id] ?? ""
              const wide = field.type === "textarea"

              return (
                <div
                  key={field.id}
                  className={wide ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
                >
                  <Label htmlFor={fieldId} className="gap-1 text-xs font-normal">
                    {t(field.label, lang)}
                    {field.required && (
                      <span className="text-muted-foreground">*</span>
                    )}
                  </Label>

                  {field.type === "textarea" ? (
                    <Textarea
                      id={fieldId}
                      rows={2}
                      value={value}
                      placeholder={t(field.placeholder, lang)}
                      onChange={(e) => setCell(index, field.id, e.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={value}
                      onValueChange={(v) => setCell(index, field.id, v)}
                    >
                      <SelectTrigger id={fieldId}>
                        <SelectValue placeholder={tr("chooseShort")} />
                      </SelectTrigger>
                      <SelectContent>
                        {resolveChoices(field, answers, lang).map((choice) => (
                          <SelectItem key={choice.value} value={choice.value}>
                            {choice.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={fieldId}
                      type={
                        field.type === "email"
                          ? "email"
                          : field.type === "number"
                            ? "number"
                            : field.type === "tel"
                              ? "tel"
                              : "text"
                      }
                      value={value}
                      placeholder={t(field.placeholder, lang)}
                      onChange={(e) => setCell(index, field.id, e.target.value)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...rows, {}])}
      >
        <Plus />
        {addLabel ?? tr("addRow")}
      </Button>
    </div>
  )
}
