"use server"

import { revalidatePath } from "next/cache"

import { DEFAULT_LANG, ui, type Lang } from "@/lib/i18n"
import { requireProfile } from "@/lib/auth"
import { sendSubmissionEmail } from "@/lib/email"
import { createClient } from "@/lib/supabase/server"
import type { AnswerMap } from "@/lib/supabase/types"
import {
  normalizeAnswers,
  validateAll,
} from "@/lib/questionnaire/validation"

export type SaveResult = {
  ok: boolean
  error?: string
  savedAt?: string
  /** The response is submitted and locked — the form should stop editing. */
  locked?: boolean
}

/**
 * Row Level Security refuses writes to a submitted response. That arrives as a
 * raw Postgres error, which is useless to the person reading it.
 */
function isLocked(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "42501" ||
    /row-level security/i.test(error.message ?? "")
  )
}

/** Upserts the draft. Called on autosave and on every step change. */
export async function saveDraft(
  answers: AnswerMap,
  lang: Lang = DEFAULT_LANG
): Promise<SaveResult> {
  const profile = await requireProfile()
  const supabase = await createClient()

  // Retired fields and blank repeater rows never reach the database.
  const clean = normalizeAnswers(answers)

  const { error } = await supabase
    .from("responses")
    .upsert(
      { user_id: profile.id, answers: clean, status: "in_progress" },
      { onConflict: "user_id" }
    )

  if (error) {
    return isLocked(error)
      ? { ok: false, locked: true, error: ui("alreadySubmitted", lang) }
      : { ok: false, error: error.message }
  }

  return { ok: true, savedAt: new Date().toISOString() }
}

export async function submitResponse(
  answers: AnswerMap,
  lang: Lang = DEFAULT_LANG
): Promise<SaveResult> {
  const profile = await requireProfile()

  const clean = normalizeAnswers(answers)

  const errors = validateAll(clean, lang)
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: ui("stillIncomplete", lang) }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("responses").upsert(
    {
      user_id: profile.id,
      answers: clean,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) {
    return isLocked(error)
      ? { ok: false, locked: true, error: ui("alreadySubmitted", lang) }
      : { ok: false, error: error.message }
  }

  // The answers are already safe in the database — a failed notification must
  // not fail the submission, so this only ever gets logged.
  const notification = await sendSubmissionEmail({
    answers: clean,
    clientEmail: profile.email,
    clientName: profile.full_name,
    lang,
  })
  if (!notification.sent) {
    console.warn("Submission email not sent:", notification.error)
  }

  revalidatePath("/questionnaire")
  revalidatePath("/admin")
  return { ok: true }
}
