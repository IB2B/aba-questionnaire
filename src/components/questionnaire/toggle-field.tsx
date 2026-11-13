"use client"

import { useLanguage } from "@/components/i18n/language-provider"
import { cn } from "@/lib/utils"

export function ToggleField({
  id,
  value,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  value: boolean | null
  invalid?: boolean
  describedBy?: string
  onChange: (value: boolean) => void
}) {
  const { tr } = useLanguage()
  const options = [
    { label: tr("yes"), on: true },
    { label: tr("no"), on: false },
  ]

  return (
    <div
      role="radiogroup"
      id={id}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className={cn(
        "inline-flex rounded-lg border p-1",
        invalid && "border-destructive"
      )}
    >
      {options.map((option) => {
        const selected = value === option.on
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.on)}
            className={cn(
              "focus-visible:ring-ring/50 min-w-20 rounded-md px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]",
              selected
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
