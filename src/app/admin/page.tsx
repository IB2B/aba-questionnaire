import { connection } from "next/server"
import Link from "next/link"
import { ArrowUpRight, Inbox } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireAdmin } from "@/lib/auth"
import { ui } from "@/lib/i18n"
import { getLang } from "@/lib/i18n/server"
import { createClient } from "@/lib/supabase/server"
import { completionPercent } from "@/lib/questionnaire/validation"
import type { ResponseWithProfile } from "@/lib/supabase/types"

export const metadata = { title: "Risposte — ABA" }

export default async function AdminPage() {
  // These pages are per-user and never prerendered; saying so up front
  // keeps request-time values (auth, signed links) out of the build.
  await connection()

  const profile = await requireAdmin()
  const lang = await getLang()
  const supabase = await createClient()

  const dateFormat = new Intl.DateTimeFormat(lang === "it" ? "it-IT" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  // `responses.user_id` points at `auth.users`, so PostgREST cannot embed
  // `profiles` directly — the two are fetched separately and joined here.
  const { data: rows, error } = await supabase
    .from("responses")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) throw new Error(`Could not load responses: ${error.message}`)

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, company")

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]))
  const responses: ResponseWithProfile[] = (rows ?? []).map((row) => ({
    ...row,
    profiles: byId.get(row.user_id) ?? null,
  }))
  const submitted = responses.filter((r) => r.status === "submitted").length

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader profile={profile} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight">
            {ui("responses", lang)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {responses.length === 0
              ? ui("noResponsesYet", lang)
              : ui("responsesCount", lang, {
                  submitted,
                  total: responses.length,
                })}
          </p>
        </div>

        {responses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
            <Inbox className="text-muted-foreground size-6" />
            <p className="text-muted-foreground max-w-xs text-sm">
              {ui("emptyAdminHint", lang)}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ui("colClient", lang)}</TableHead>
                  <TableHead>{ui("colCompany", lang)}</TableHead>
                  <TableHead>{ui("colStatus", lang)}</TableHead>
                  <TableHead>{ui("colProgress", lang)}</TableHead>
                  <TableHead>{ui("colUpdated", lang)}</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>
                      <span className="block font-medium">
                        {response.profiles?.full_name || "—"}
                      </span>
                      <span className="text-muted-foreground block text-xs">
                        {response.profiles?.email}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {response.profiles?.company || "—"}
                    </TableCell>
                    <TableCell>
                      {response.status === "submitted" ? (
                        <Badge variant="success">
                          {ui("statusSubmitted", lang)}
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          {ui("statusInProgress", lang)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {completionPercent(response.answers)}%
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {dateFormat.format(new Date(response.updated_at))}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/${response.id}`}
                        aria-label={ui("openResponse", lang)}
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex rounded-md p-1 outline-none focus-visible:ring-[3px]"
                      >
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  )
}

export const instant = false
