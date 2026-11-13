"use client"

import { Plus, X } from "lucide-react"

import { useLanguage } from "@/components/i18n/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DEFAULT_COLOR = "#2563eb"

export function ColorField({
  id,
  values,
  multiple,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  values: string[]
  multiple?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (values: string[]) => void
}) {
  const { tr } = useLanguage()
  // Always show at least one row so there is something to click.
  const rows = values.length > 0 ? values : [DEFAULT_COLOR]

  function setAt(index: number, color: string) {
    const next = [...rows]
    next[index] = color
    onChange(next)
  }

  return (
    <div className="space-y-2" id={id} aria-describedby={describedBy}>
      {rows.map((color, index) => (
        <div key={index} className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`${id}-${index}`}>
            {tr("colourN", { n: index + 1 })}
          </label>

          <input
            id={`${id}-${index}`}
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_COLOR}
            onChange={(e) => setAt(index, e.target.value)}
            className="border-input size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
          />

          <Input
            value={color}
            aria-invalid={invalid || undefined}
            onChange={(e) => setAt(index, e.target.value)}
            placeholder="#2563EB"
            className="max-w-32 font-mono uppercase"
          />

          {rows.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={tr("removeColour", { n: index + 1 })}
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              <X />
            </Button>
          )}
        </div>
      ))}

      {multiple && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...rows, DEFAULT_COLOR])}
        >
          <Plus />
          {tr("addColour")}
        </Button>
      )}
    </div>
  )
}
