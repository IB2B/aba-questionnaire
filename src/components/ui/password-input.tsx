"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { useLanguage } from "@/components/i18n/language-provider"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** A password field with a show/hide toggle on the right. */
export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = React.useState(false)
  const { tr } = useLanguage()

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? tr("hidePassword") : tr("showPassword")}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-md outline-none focus-visible:ring-[3px]"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
