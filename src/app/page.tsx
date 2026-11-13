import { connection } from "next/server"
import { redirect } from "next/navigation"

import { requireProfile } from "@/lib/auth"

export default async function RootPage() {
  // These pages are per-user and never prerendered; saying so up front
  // keeps request-time values (auth, signed links) out of the build.
  await connection()

  const profile = await requireProfile()
  redirect(profile.role === "admin" ? "/admin" : "/questionnaire")
}

export const instant = false
