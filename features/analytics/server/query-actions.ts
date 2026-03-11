"use server"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { getAnalyticsOverview } from "@/features/analytics/server/overview"

export async function getAnalyticsOverviewAction() {
  const user = await requireCurrentUser()

  return getAnalyticsOverview(user.id)
}
