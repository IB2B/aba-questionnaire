"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { signIn, type AuthState } from "@/app/auth/actions"
import { useLanguage } from "@/components/i18n/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      {label}
    </Button>
  )
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"
  const { lang, tr } = useLanguage()
  const [state, formAction] = useActionState<AuthState, FormData>(signIn, {})

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="lang" value={lang} />

      <div className="space-y-2">
        <Label htmlFor="email">{tr("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@azienda.it"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{tr("password")}</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton label={tr("signIn")} />
    </form>
  )
}
