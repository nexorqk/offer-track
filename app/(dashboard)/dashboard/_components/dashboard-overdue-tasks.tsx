import { AlertTriangle, ArrowRight, ClockFading } from "lucide-react"

import type { DashboardOverdueTask } from "../_lib/dashboard-overview"

type DashboardOverdueTasksProps = {
  items: DashboardOverdueTask[]
}

export function DashboardOverdueTasks({
  items,
}: Readonly<DashboardOverdueTasksProps>) {
  return (
    <article className="overflow-hidden rounded-[2rem] border bg-[radial-gradient(circle_at_top_right,color-mix(in_oklch,var(--color-destructive)_10%,transparent),transparent_38%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_28%,transparent))] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Overdue tasks
          </span>
          <h3 className="text-xl font-semibold tracking-tight">
            Follow-ups slipping behind
          </h3>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-700 dark:text-rose-300">
          <AlertTriangle className="size-4" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-[1.5rem] border border-dashed bg-background/70 p-4 text-sm text-muted-foreground">
          Nothing overdue. Keep the cadence.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.5rem] border bg-background/80 p-4 shadow-[0_1px_0_color-mix(in_oklch,var(--color-foreground)_5%,transparent)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <strong className="text-sm font-medium md:text-base">
                    {item.title}
                  </strong>
                  <p className="text-sm text-muted-foreground">
                    {item.companyName} · {item.jobTitle}
                  </p>
                </div>
                <span className="rounded-full bg-rose-500/12 px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-rose-700 dark:text-rose-300">
                  {daysOverdueLabel(item.dueDate)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ClockFading className="size-4" />
                  <span>Due {formatDueDate(item.dueDate)}</span>
                </div>
                <ArrowRight className="size-4" />
              </div>
            </article>
          ))}
        </div>
      )}
    </article>
  )
}

function daysOverdueLabel(value: Date) {
  const diffDays = Math.max(
    1,
    Math.ceil((Date.now() - value.getTime()) / (1000 * 60 * 60 * 24)),
  )

  return `${diffDays}d late`
}

function formatDueDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(value)
}
