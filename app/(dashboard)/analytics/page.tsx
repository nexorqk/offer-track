import { requireCurrentUser } from "@/features/auth/server/auth"
import { AnalyticsPageQuery } from "@/features/analytics/components/analytics-page-query"
import { getAnalyticsOverview } from "@/features/analytics/server/overview"

export default async function AnalyticsPage() {
  const user = await requireCurrentUser()
  const analytics = await getAnalyticsOverview(user.id)

  return <AnalyticsPageQuery initialData={analytics} />
}
