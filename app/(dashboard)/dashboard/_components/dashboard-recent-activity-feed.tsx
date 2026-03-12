import { CalendarPlus2, CircleDashed, FilePenLine } from "lucide-react"

import type { DashboardActivityItem } from "../_lib/dashboard-overview"

type DashboardRecentActivityFeedProps = {
  items: DashboardActivityItem[]
}

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

export function DashboardRecentActivityFeed({
  items,
}: Readonly<DashboardRecentActivityFeedProps>) {
  return (
    <article className="relative overflow-hidden rounded-[2.25rem] border bg-background/92 p-5 shadow-sm backdrop-blur surface-enter surface-enter-delay-1">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_55%),linear-gradient(180deg,color-mix(in_oklch,var(--color-muted)_38%,transparent),transparent)]" />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="eyebrow-label">
              Recent activity
            </span>
            <h3 className="text-2xl font-semibold tracking-tight">
              What moved most recently
            </h3>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Stage changes, fresh notes, and newly booked interviews surface here first.
            </p>
          </div>

          <div className="inline-flex self-start rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {items.length} events
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
            Activity will appear here once jobs, interviews, and notes start
            moving.
          </div>
        ) : (
          <div className="relative flex flex-col gap-3 pl-5 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-border">
            {items.map((item, index) => {
              const Icon = getActivityIcon(item.kind)

              return (
                <article
                  key={item.id}
                  className="group relative grid gap-3 rounded-[1.75rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_24%,transparent))] p-4 surface-enter hover-lift md:grid-cols-[auto_1fr_auto]"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span className="absolute -left-[1.68rem] top-5 size-4 rounded-full border-[5px] border-background bg-primary shadow-sm" />

                  <div className="flex items-center gap-3 md:items-start">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border bg-secondary/80 text-secondary-foreground shadow-sm">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-medium md:text-base">
                          {item.title}
                        </strong>
                        <span className="rounded-full border px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {item.kind}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item.summary}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {item.companyName} · {item.jobTitle}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:block" />

                  <div className="flex items-center justify-between gap-3 text-sm md:flex-col md:items-end md:justify-center">
                    <span className="rounded-full border bg-background/80 px-2.5 py-1 font-medium text-foreground">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </article>
  )
}

function getActivityIcon(kind: DashboardActivityItem["kind"]) {
  switch (kind) {
    case "stage":
      return CircleDashed
    case "note":
      return FilePenLine
    case "interview":
      return CalendarPlus2
  }
}

function formatRelativeTime(value: Date) {
  const diffMs = value.getTime() - Date.now()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))

  if (Math.abs(diffHours) < 24) {
    return relativeTime.format(diffHours, "hour")
  }

  return relativeTime.format(Math.round(diffHours / 24), "day")
}
