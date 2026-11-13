"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  DEFAULT_LANG,
  LANG_COOKIE,
  ui,
  type Lang,
  type UiKey,
} from "@/lib/i18n"

type LanguageContext = {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Shorthand for an interface string in the current language. */
  tr: (key: UiKey, vars?: Record<string, string | number>) => string
}

const Context = React.createContext<LanguageContext | null>(null)

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang
  children: React.ReactNode
}) {
  const router = useRouter()
  const [lang, setLangState] = React.useState<Lang>(initialLang)

  const setLang = React.useCallback(
    (next: Lang) => {
      setLangState(next)
      // A year-long cookie so server components render in the same language.
      document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`
      router.refresh()
    },
    [router]
  )

  const value = React.useMemo<LanguageContext>(
    () => ({
      lang,
      setLang,
      tr: (key, vars) => ui(key, lang, vars),
    }),
    [lang, setLang]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useLanguage(): LanguageContext {
  const context = React.useContext(Context)
  if (context) return context
  // Outside a provider (a stray render) fall back to the default language
  // rather than throwing — the interface still reads correctly.
  return {
    lang: DEFAULT_LANG,
    setLang: () => {},
    tr: (key, vars) => ui(key, DEFAULT_LANG, vars),
  }
}
