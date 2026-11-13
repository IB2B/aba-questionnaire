import { connection } from "next/server"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { AnswerSummary } from "@/components/questionnaire/answer-summary"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { requireAdmin } from "@/lib/auth"
import { ui } from "@/lib/i18n"
import { getLang } from "@/lib/i18n/server"
import { signedFileUrls } from "@/lib/questionnaire/file-urls"
import { createClient } from "@/lib/supabase/server"
import { completionPercent } from "@/lib/questionnaire/validation"
import type { ResponseWithProfile } from "@/lib/supabase/types"

export const metadata = { title: "Risposta — ABA" }

export default async function AdminResponsePage({
  params,
}: PageProps<"/admin/[id]">) {
  await connection()
  const { id } = await params
  const profile = await requireAdmin()
  const lang = await getLang()
  const supabase = await createClient()

  const dateTimeFormat = new Intl.DateTimeFormat(
    lang === "it" ? "it-IT" : "en-GB",
    { dateStyle: "medium", timeStyle: "short" }
  )

  const { data: row, error } = await supabase
    .from("responses")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(`Could not load the response: ${error.message}`)
  if (!row) notFound()

  // Joined here rather than embedded: see the note on the responses list.
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, email, full_name, company")
    .eq("id", row.user_id)
    .maybeSingle()

  const response: ResponseWithProfile = { ...row, profiles: profileRow ?? null }
  const fileUrls = await signedFileUrls(response.answers)

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader profile={profile} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-md text-sm outline-none focus-visible:ring-[3px]"
        >
          <ArrowLeft className="size-4" />
          {ui("allResponses", lang)}
        </Link>

        <div className="mt-6 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              {response.profiles?.full_name ||
                response.profiles?.email ||
                ui("colClient", lang)}
            </h1>
            {response.status === "submitted" ? (
              <Badge variant="success">{ui("statusSubmitted", lang)}</Badge>
            ) : (
              <Badge variant="warning">
                {ui("statusInProgress", lang)} —{" "}
                {completionPercent(response.answers)}%
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground text-sm">
            {[response.profiles?.company, response.profiles?.email]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <p className="text-muted-foreground text-xs">
            {response.submitted_at
              ? ui("submittedOn", lang, {
                  date: dateTimeFormat.format(new Date(response.submitted_at)),
                })
              : ui("updatedOn", lang, {
                  date: dateTimeFormat.format(new Date(response.updated_at)),
                })}
          </p>
        </div>

        <Separator className="my-8" />

        <AnswerSummary
          answers={response.answers}
          lang={lang}
          fileUrls={fileUrls}
        />
      </main>
    </div>
  )
}

export const instant = false
