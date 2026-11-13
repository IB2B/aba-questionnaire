import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/supabase/types"

/** The signed-in user's profile, or a redirect to /login. */
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    // The signup trigger should have created it; if not, the account is in a
    // broken state and signing back in is the cleanest recovery.
    redirect("/login")
  }

  return profile
}

/** Same, but sends non-admins back to their own questionnaire. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile()
  if (profile.role !== "admin") redirect("/questionnaire")
  return profile
}
