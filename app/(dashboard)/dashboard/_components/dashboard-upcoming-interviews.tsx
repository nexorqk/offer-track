import { CalendarRange, Clock3, MapPin } from "lucide-react"

import type { DashboardUpcomingInterview } from "../_lib/dashboard-overview"

type DashboardUpcomingInterviewsProps = {
  items: DashboardUpcomingInterview[]
}

const interviewDateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
})

export function DashboardUpcomingInterviews({
  items,
}: Readonly<DashboardUpcomingInterviewsProps>) {
  return (
    <article className="overflow-hidden rounded-[2rem] border bg-background/92 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4 border-b pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Upcoming interviews
          </span>
          <h3 className="text-xl font-semibold tracking-tight">
            Conversations on deck
          </h3>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/12 text-cyan-700 dark:text-cyan-300">
          <CalendarRange className="size-4" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-[1.5rem] border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
          No interviews are scheduled yet.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.5rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_28%,transparent))] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-base font-medium">{item.companyName}</strong>
                    <span className="rounded-full bg-cyan-500/12 px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                      {formatInterviewType(item.type)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.jobTitle}</p>
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {countdownLabel(item.scheduledAt)}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4" />
                  <span>{interviewDateFormatter.format(item.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{item.location ?? "TBD"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </article>
  )
}

function formatInterviewType(value: DashboardUpcomingInterview["type"]) {
  switch (value) {
    case "hr":
      return "HR"
    case "technical":
      return "Technical"
    case "final":
      return "Final"
  }
}

function countdownLabel(value: Date) {
  const diffMs = value.getTime() - Date.now()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return "Today"
  }

  if (diffDays === 1) {
    return "Tomorrow"
  }

  return `In ${diffDays} days`
}
