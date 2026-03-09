import { requireCurrentUser } from "@/features/auth/server/auth"

import { DashboardOverdueTasks } from "./_components/dashboard-overdue-tasks"
import { DashboardRecentActivityFeed } from "./_components/dashboard-recent-activity-feed"
import { DashboardSummaryCards } from "./_components/dashboard-summary-cards"
import { DashboardUpcomingInterviews } from "./_components/dashboard-upcoming-interviews"
import { getDashboardOverview } from "./_lib/dashboard-overview"

export default async function DashboardPage() {
  const user = await requireCurrentUser()
  const overview = await getDashboardOverview(user.id)

  return (
    <div className="flex flex-col gap-5 pb-8">
      <DashboardSummaryCards summary={overview.summary} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.9fr)]">
        <DashboardRecentActivityFeed items={overview.recentActivity} />

        <div className="grid gap-5 self-start">
          <DashboardUpcomingInterviews items={overview.upcomingInterviews} />
          <DashboardOverdueTasks items={overview.overdueTasks} />
        </div>
      </section>

      <div className="text-xs text-muted-foreground">
        Press <kbd>d</kbd> to toggle dark mode.
      </div>
    </div>
  )
}
