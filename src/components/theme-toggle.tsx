"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { useLanguage } from "@/components/i18n/language-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { tr } = useLanguage()

  // The icons swap on the `.dark` class rather than on a mounted flag, so the
  // server and client markup match and there is nothing to hydrate around.
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={tr("toggleTheme")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
