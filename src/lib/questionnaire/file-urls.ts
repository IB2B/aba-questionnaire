import "server-only"

import { connection } from "next/server"

import { createClient } from "@/lib/supabase/server"
import {
  BRANDING_BUCKET,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/questionnaire/uploads"
import type { FileUrls } from "@/components/questionnaire/answer-summary"
import type { AnswerMap } from "@/lib/supabase/types"

/**
 * Short-lived download links for every uploaded file in a response.
 * The bucket is private, so these signed URLs are the only way in.
 */
export async function signedFileUrls(answers: AnswerMap): Promise<FileUrls> {
  const uploads = Object.entries(answers).flatMap(([id, value]) =>
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "kind" in value &&
    value.kind === "upload"
      ? [[id, value.path] as const]
      : []
  )

  if (uploads.length === 0) return {}

  // Signing reads the clock (Supabase stamps an expiry with `Date.now()`), and
  // a changing value cannot be prerendered. This marks the render as happening
  // at request time, which is what a short-lived link needs anyway.
  await connection()

  const supabase = await createClient()
  const entries = await Promise.all(
    uploads.map(async ([id, path]) => {
      const { data } = await supabase.storage
        .from(BRANDING_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
      return [id, data?.signedUrl] as const
    })
  )

  return Object.fromEntries(
    entries.filter((e): e is readonly [string, string] => Boolean(e[1]))
  )
}
