"use client"

import * as React from "react"
import { Check, Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { useLanguage } from "@/components/i18n/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { BRANDING_BUCKET, MAX_UPLOAD_BYTES } from "@/lib/questionnaire/uploads"
import type { FileAnswer } from "@/lib/supabase/types"

export function FileField({
  id,
  userId,
  value,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  userId: string
  value: FileAnswer | null
  invalid?: boolean
  describedBy?: string
  onChange: (value: FileAnswer | null) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const { tr } = useLanguage()

  async function handleFile(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(tr("uploadTooBig"))
      return
    }

    setUploading(true)
    const supabase = createClient()
    const safeName = file.name.replace(/[^\w.\-]+/g, "_")
    const path = `${userId}/${id}/${Date.now()}-${safeName}`

    const { error } = await supabase.storage
      .from(BRANDING_BUCKET)
      .upload(path, file, { upsert: true })

    setUploading(false)

    if (error) {
      // Surface the real reason — a missing bucket and a blocked policy look
      // identical otherwise, and both are one-line fixes in Supabase.
      console.error("Storage upload failed:", error)
      toast.error(tr("uploadFailed"), { description: error.message })
      return
    }

    onChange({ kind: "upload", path, name: file.name })
  }

  if (value?.kind === "upload") {
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span className="flex-1 truncate text-sm">{value.name}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={tr("removeFile")}
          onClick={() => onChange(null)}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ""
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
        {uploading ? tr("uploading") : tr("uploadFile")}
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground shrink-0 text-xs">
          {tr("orLink")}
        </span>
        <Input
          id={id}
          type="url"
          inputMode="url"
          // Without this the browser offers the current page URL as a
          // suggestion and can autofill it into every link field at once.
          autoComplete="off"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          placeholder="https://drive.google.com/…"
          value={value?.kind === "link" ? value.url : ""}
          onChange={(e) =>
            onChange(
              e.target.value ? { kind: "link", url: e.target.value } : null
            )
          }
        />
      </div>
    </div>
  )
}
