import Link from "next/link"

import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { getLang } from "@/lib/i18n/server"

export default async function NotFound() {
  const lang = await getLang()
  const copy =
    lang === "it"
      ? {
          title: "Pagina non trovata",
          body: "Il link potrebbe essere vecchio o errato.",
          action: "Torna all'inizio",
        }
      : {
          title: "Page not found",
          body: "That link may be old or mistyped.",
          action: "Back to the start",
        }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-5 py-5 sm:px-8">
        <Logo />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
        <div className="max-w-sm space-y-4 text-center">
          <p className="text-muted-foreground font-mono text-sm">404</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {copy.title}
          </h1>
          <p className="text-muted-foreground text-sm">{copy.body}</p>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            {copy.action}
          </Link>
        </div>
      </main>
    </div>
  )
}

export const instant = false
