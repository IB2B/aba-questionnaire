import { connection } from "next/server"
import { CheckCircle2 } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { AnswerSummary } from "@/components/questionnaire/answer-summary"
import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form"
import { Separator } from "@/components/ui/separator"
import { requireProfile } from "@/lib/auth"
import { ui } from "@/lib/i18n"
import { getLang } from "@/lib/i18n/server"
import { signedFileUrls } from "@/lib/questionnaire/file-urls"
import { createClient } from "@/lib/supabase/server"
import type { AnswerMap } from "@/lib/supabase/types"

export const metadata = { title: "Onboarding — ABA" }

export default async function QuestionnairePage() {
  // These pages are per-user and never prerendered; saying so up front
  // keeps request-time values (auth, signed links) out of the build.
  await connection()

  const profile = await requireProfile()
  const lang = await getLang()
  const supabase = await createClient()

  const { data: response } = await supabase
    .from("responses")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle()

  const answers: AnswerMap = response?.answers ?? {}
  const submitted = response?.status === "submitted"
  const fileUrls = submitted ? await signedFileUrls(answers) : {}

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader profile={profile} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        {submitted ? (
          <div className="space-y-8">
            <div className="space-y-4 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-600/10">
                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-semibold tracking-tight">
                  {ui("doneTitle", lang)}
                </h1>
                <p className="text-muted-foreground mx-auto max-w-md text-sm">
                  {ui("doneBody", lang)}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="mb-6 text-sm font-medium">
                {ui("whatYouSent", lang)}
              </h2>
              <AnswerSummary
                answers={answers}
                lang={lang}
                fileUrls={fileUrls}
              />
            </div>
          </div>
        ) : (
          <QuestionnaireForm initialAnswers={answers} userId={profile.id} />
        )}
      </main>
    </div>
  )
}

export const instant = false
