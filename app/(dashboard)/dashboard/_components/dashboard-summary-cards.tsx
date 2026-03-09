import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  MessageSquareText,
  Siren,
} from "lucide-react"

type DashboardSummaryCardsProps = {
  summary: {
    activeApplications: number
    interviewCount: number
    lateStageApplications: number
    overdueTasks: number
    responseRate: number
    responseRateBase: number
  }
}

const cardThemes = [
  {
    accent: "from-orange-500/24 via-orange-400/10 to-transparent",
    bars: ["h-4", "h-7", "h-5", "h-9", "h-6"],
    icon: BriefcaseBusiness,
    key: "activeApplications",
    ring: "bg-orange-500/12 text-orange-700 dark:text-orange-300",
  },
  {
    accent: "from-cyan-500/24 via-cyan-400/10 to-transparent",
    bars: ["h-6", "h-8", "h-5", "h-7", "h-9"],
    icon: CalendarClock,
    key: "interviewCount",
    ring: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
  },
  {
    accent: "from-emerald-500/24 via-emerald-400/10 to-transparent",
    bars: ["h-5", "h-8", "h-10", "h-7", "h-9"],
    icon: MessageSquareText,
    key: "responseRate",
    ring: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  },
  {
    accent: "from-rose-500/24 via-rose-400/10 to-transparent",
    bars: ["h-10", "h-8", "h-6", "h-5", "h-4"],
    icon: Siren,
    key: "overdueTasks",
    ring: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  },
] as const

export function DashboardSummaryCards({
  summary,
}: Readonly<DashboardSummaryCardsProps>) {
  const cards = [
    {
      eyebrow: "Open pipeline",
      key: "activeApplications",
      note:
        summary.lateStageApplications > 0
          ? `${summary.lateStageApplications} in technical or better`
          : "No roles past screening yet",
      value: String(summary.activeApplications),
    },
    {
      eyebrow: "Next seven days",
      key: "interviewCount",
      note:
        summary.interviewCount > 0
          ? `${summary.interviewCount} conversations already booked`
          : "Nothing booked right now",
      value: String(summary.interviewCount),
    },
    {
      eyebrow: "Signals back",
      key: "responseRate",
      note:
        summary.responseRateBase > 0
          ? `${summary.responseRateBase} sent applications tracked`
          : "Build the first outbound batch",
      value: `${summary.responseRate}%`,
    },
    {
      eyebrow: "Needs action",
      key: "overdueTasks",
      note:
        summary.overdueTasks > 0
          ? "Clear the blockers before the next interview loop"
          : "Task queue is under control",
      value: String(summary.overdueTasks),
    },
  ] as const

  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {cards.map((card, index) => {
        const theme = cardThemes[index]
        const Icon = theme.icon

        return (
          <article
            key={card.key}
            className="group relative overflow-hidden rounded-[2rem] border bg-background/90 p-5 shadow-sm backdrop-blur"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${theme.accent}`}
            />
            <div className="relative flex flex-col gap-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                    {card.eyebrow}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-4xl font-semibold tracking-tight">
                      {card.value}
                    </strong>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.68rem] font-medium ${theme.ring}`}
                    >
                      <ArrowUpRight className="size-3" />
                      Live
                    </span>
                  </div>
                </div>

                <div
                  className={`flex size-11 items-center justify-center rounded-2xl ${theme.ring}`}
                >
                  <Icon className="size-5" />
                </div>
              </div>

              <div className="flex items-end gap-2">
                {theme.bars.map((height, barIndex) => (
                  <div
                    key={`${card.key}-${barIndex}`}
                    className={`w-full rounded-full bg-gradient-to-t ${theme.accent} ${height} transition-transform duration-200 group-hover:-translate-y-0.5`}
                  />
                ))}
              </div>

              <p className="max-w-64 text-sm leading-6 text-muted-foreground">
                {card.note}
              </p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
