import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { ui } from "@/lib/i18n"
import { getLang } from "@/lib/i18n/server"

export const metadata = { title: "Accedi — ABA" }

export default async function LoginPage() {
  const lang = await getLang()

  return (
    <AuthShell
      title={ui("welcomeBack", lang)}
      subtitle={ui("signInSubtitle", lang)}
      footer={ui("accountsByAba", lang)}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}

export const instant = false
