import {
  BadgeCheck,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  Sparkles,
} from "lucide-react"

type DashboardSummaryCardsProps = {
  summary: {
    activeApplications: number
    interviews: number
    offers: number
    totalJobs: number
  }
}

const cardThemes = [
  {
    accent: "from-orange-500/24 via-orange-400/10 to-transparent",
    bars: ["h-4", "h-7", "h-5", "h-9", "h-6"],
    icon: BriefcaseBusiness,
    key: "totalJobs",
    marker: "Board size",
    ring: "bg-orange-500/12 text-orange-700 dark:text-orange-300",
  },
  {
    accent: "from-cyan-500/24 via-cyan-400/10 to-transparent",
    bars: ["h-6", "h-8", "h-5", "h-7", "h-9"],
    icon: CalendarClock,
    key: "activeApplications",
    marker: "In motion",
    ring: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
  },
  {
    accent: "from-emerald-500/24 via-emerald-400/10 to-transparent",
    bars: ["h-5", "h-8", "h-10", "h-7", "h-9"],
    icon: Sparkles,
    key: "interviews",
    marker: "Signal",
    ring: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  },
  {
    accent: "from-rose-500/24 via-rose-400/10 to-transparent",
    bars: ["h-10", "h-8", "h-6", "h-5", "h-4"],
    icon: BadgeCheck,
    key: "offers",
    marker: "Outcome",
    ring: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  },
] as const

const cardDelayClasses = [
  "surface-enter-delay-1",
  "surface-enter-delay-2",
  "surface-enter-delay-3",
  "surface-enter-delay-4",
] as const

export function DashboardSummaryCards({
  summary,
}: Readonly<DashboardSummaryCardsProps>) {
  const cards = [
    {
      eyebrow: "Total jobs",
      key: "totalJobs",
      note:
        summary.totalJobs > 0
          ? `${summary.totalJobs} tracked opportunities across the funnel`
          : "Add the first role to start the pipeline",
      value: String(summary.totalJobs),
    },
    {
      eyebrow: "Active applications",
      key: "activeApplications",
      note:
        summary.activeApplications > 0
          ? `${summary.activeApplications} roles still moving through the pipeline`
          : "No active roles in flight right now",
      value: String(summary.activeApplications),
    },
    {
      eyebrow: "Interviews",
      key: "interviews",
      note:
        summary.interviews > 0
          ? `${summary.interviews} interview loops captured so far`
          : "No interviews recorded yet",
      value: String(summary.interviews),
    },
    {
      eyebrow: "Offers",
      key: "offers",
      note:
        summary.offers > 0
          ? `${summary.offers} roles reached the offer stage`
          : "No offers on the board yet",
      value: String(summary.offers),
    },
  ] as const

  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {cards.map((card, index) => {
        const theme = cardThemes[index]
        const Icon = theme.icon
        const ratioLabel =
          theme.key === "totalJobs"
            ? "Full tracked board"
            : summary.totalJobs > 0
              ? `${Math.round((Number(card.value) / summary.totalJobs) * 100)}% of all roles`
              : "Waiting for first role"

        return (
          <article
            key={card.key}
            className={`group relative overflow-hidden rounded-[2.15rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_94%,transparent),color-mix(in_oklch,var(--color-muted)_18%,transparent))] p-5 shadow-sm backdrop-blur surface-enter hover-lift ${cardDelayClasses[index]}`}
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${theme.accent}`}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,color-mix(in_oklch,var(--color-background)_92%,transparent))]" />

            <div className="relative flex flex-col gap-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="eyebrow-label">
                      {card.eyebrow}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.68rem] font-medium ${theme.ring}`}
                    >
                      <ArrowUpRight className="size-3" />
                      {theme.marker}
                    </span>
                  </div>

                  <div className="flex items-end gap-3">
                    <strong className="text-4xl font-semibold tracking-tight md:text-[2.7rem]">
                      {card.value}
                    </strong>
                    <span className="pb-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {ratioLabel}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex size-11 items-center justify-center rounded-[1.4rem] border border-white/40 shadow-sm ${theme.ring}`}
                >
                  <Icon className="size-5" />
                </div>
              </div>

              <div className="rounded-[1.6rem] border bg-background/70 p-4 backdrop-blur">
                <div className="mb-4 flex items-end gap-2">
                  {theme.bars.map((height, barIndex) => (
                    <div
                      key={`${card.key}-${barIndex}`}
                      className={`w-full rounded-full bg-gradient-to-t ${theme.accent} ${height} transition-transform duration-200 group-hover:-translate-y-0.5`}
                    />
                  ))}
                </div>

                <div className="flex items-end justify-between gap-4">
                  <p className="max-w-52 text-sm leading-6 text-muted-foreground">
                    {card.note}
                  </p>
                  <span className="text-right text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Live snapshot
                  </span>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
