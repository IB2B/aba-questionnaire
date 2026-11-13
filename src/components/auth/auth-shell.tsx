"use client"

import Link from "next/link"

import { LanguageToggle } from "@/components/i18n/language-toggle"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="focus-visible:ring-ring/50 rounded-md outline-none focus-visible:ring-[3px]"
        >
          <Logo />
        </Link>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="text-muted-foreground mt-6 text-center text-sm">
            {footer}
          </div>
        </div>
      </main>
    </div>
  )
}
