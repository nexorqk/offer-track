import { ArrowRightLeft, BriefcaseBusiness, Radar, ShieldX } from "lucide-react"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { getAnalyticsOverview } from "@/features/analytics/server/overview"

export default async function AnalyticsPage() {
  const user = await requireCurrentUser()
  const analytics = await getAnalyticsOverview(user.id)

  return (
    <div className="flex flex-col gap-5 pb-8">
      <section className="overflow-hidden rounded-[2.25rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_22%,transparent))] p-5 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Insights
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Funnel analytics built on your real pipeline.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Track stage conversion, response rate, interview rate, and source mix without leaving the app.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={BriefcaseBusiness}
              label="Total tracked"
              note="All jobs in the workspace"
              value={String(analytics.summary.totalJobs)}
            />
            <StatCard
              icon={Radar}
              label="Interview rate"
              note="Applied jobs that reached an interview stage"
              value={`${analytics.summary.interviewRate}%`}
            />
            <StatCard
              icon={ArrowRightLeft}
              label="Response rate"
              note="Reached any response stage"
              value={`${analytics.summary.responseRate}%`}
            />
            <StatCard
              icon={ShieldX}
              label="Rejections"
              note="Jobs currently closed out as rejected"
              value={String(analytics.summary.rejectionCount)}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <article className="rounded-[2rem] border bg-background/92 p-5 shadow-sm">
          <div className="flex flex-col gap-1 border-b pb-4">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Funnel
            </span>
            <h2 className="text-2xl font-semibold tracking-tight">
              Conversion by stage
            </h2>
          </div>

          <div className="mt-4 grid gap-3">
            {analytics.funnel.map((entry) => (
              <div
                key={entry.status}
                className="grid gap-3 rounded-[1.5rem] border bg-muted/15 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <div className="flex flex-col gap-1">
                  <strong className="text-sm font-semibold">
                    {formatStatusLabel(entry.status)}
                  </strong>
                  <span className="text-sm text-muted-foreground">
                    {entry.count} jobs have reached this stage
                  </span>
                </div>
                <div className="flex min-w-24 items-center justify-between gap-3 rounded-2xl border bg-background px-3 py-2 text-sm md:justify-center">
                  <span className="text-muted-foreground">Reached</span>
                  <strong>{entry.count}</strong>
                </div>
                <div className="flex min-w-28 items-center justify-between gap-3 rounded-2xl border bg-background px-3 py-2 text-sm md:justify-center">
                  <span className="text-muted-foreground">Conv.</span>
                  <strong>
                    {entry.conversionFromPrevious === null
                      ? "n/a"
                      : `${entry.conversionFromPrevious}%`}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border bg-background/92 p-5 shadow-sm">
          <div className="flex flex-col gap-1 border-b pb-4">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Sources
            </span>
            <h2 className="text-2xl font-semibold tracking-tight">
              Source breakdown
            </h2>
          </div>

          <div className="mt-4 grid gap-3">
            {analytics.sourceBreakdown.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Source metrics will appear once jobs are added.
              </div>
            ) : (
              analytics.sourceBreakdown.map((entry) => (
                <div
                  key={entry.source}
                  className="flex items-center justify-between gap-3 rounded-[1.5rem] border bg-muted/15 px-4 py-3"
                >
                  <div className="flex flex-col gap-1">
                    <strong className="text-sm font-semibold">{entry.source}</strong>
                    <span className="text-sm text-muted-foreground">
                      {entry.count} tracked opportunities
                    </span>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-sm font-medium">
                    {entry.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  note: string
  value: string
}) {
  return (
    <div className="rounded-[1.5rem] border bg-background/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </span>
          <strong className="text-3xl font-semibold tracking-tight">{value}</strong>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{note}</p>
    </div>
  )
}

function formatStatusLabel(value: string) {
  if (value === "hr_screen") {
    return "HR screen"
  }

  return value[0].toUpperCase() + value.slice(1)
}
