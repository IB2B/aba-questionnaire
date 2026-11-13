"use client"

import Link from "next/link"
import { LogOut } from "lucide-react"

import { signOut } from "@/app/auth/actions"
import { useLanguage } from "@/components/i18n/language-provider"
import { LanguageToggle } from "@/components/i18n/language-toggle"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Profile } from "@/lib/supabase/types"

function initials(profile: Profile) {
  const source = profile.full_name?.trim() || profile.email
  return source.slice(0, 2).toUpperCase()
}

export function AppHeader({ profile }: { profile: Profile }) {
  const { tr } = useLanguage()

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link
          href={profile.role === "admin" ? "/admin" : "/questionnaire"}
          className="focus-visible:ring-ring/50 rounded-md outline-none focus-visible:ring-[3px]"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={tr("accountMenu")}
                className="rounded-full"
              >
                <span className="bg-secondary text-secondary-foreground grid size-7 place-items-center rounded-full text-[11px] font-medium">
                  {initials(profile)}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-sm font-medium">
                  {profile.full_name || tr("yourAccount")}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {profile.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <form action={signOut}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    <LogOut className="size-4" />
                    {tr("signOut")}
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
