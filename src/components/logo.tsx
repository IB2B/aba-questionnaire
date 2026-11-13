import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="bg-foreground text-background grid size-7 place-items-center rounded-md text-[11px] font-semibold tracking-tight">
        ABA
      </span>
      <span className="text-sm font-medium tracking-tight">Web Agency</span>
    </span>
  )
}
