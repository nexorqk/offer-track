import { cn } from "@/lib/utils"

const statusToneByValue: Record<string, string> = {
  applied:
    "border-sky-500/20 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  final:
    "border-emerald-500/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  hr_screen:
    "border-indigo-500/20 bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
  offer:
    "border-rose-500/20 bg-rose-500/12 text-rose-700 dark:text-rose-300",
  rejected:
    "border-foreground/10 bg-secondary text-secondary-foreground",
  technical:
    "border-cyan-500/20 bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
  wishlist:
    "border-amber-500/20 bg-amber-500/12 text-amber-700 dark:text-amber-300",
}

export function JobStatusBadge({
  className,
  status,
}: Readonly<{
  className?: string
  status: string
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em]",
        statusToneByValue[status] ?? "border-foreground/10 bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {formatJobStatusLabel(status)}
    </span>
  )
}

export function formatJobStatusLabel(value: string) {
  if (value === "hr_screen") {
    return "HR screen"
  }

  return value[0].toUpperCase() + value.slice(1)
}
