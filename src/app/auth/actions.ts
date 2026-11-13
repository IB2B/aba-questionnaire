"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { DEFAULT_LANG, isLang, ui } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/server"

export type AuthState = { error?: string }

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "/")
  const rawLang = formData.get("lang")
  const lang = isLang(rawLang) ? rawLang : DEFAULT_LANG

  if (!email || !password) {
    return { error: ui("enterEmailPassword", lang) }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  redirect(next.startsWith("/") ? next : "/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
