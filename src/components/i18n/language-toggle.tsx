"use client"

import { useLanguage } from "@/components/i18n/language-provider"
import { LANGS } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function LanguageToggle() {
  const { lang, setLang, tr } = useLanguage()

  return (
    <div
      role="group"
      aria-label={tr("language")}
      className="bg-muted/60 flex items-center rounded-md p-0.5"
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={cn(
            "focus-visible:ring-ring/50 rounded px-2 py-1 text-xs font-medium uppercase transition-colors outline-none focus-visible:ring-[3px]",
            lang === code
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
