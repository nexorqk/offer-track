import "server-only"

import { desc, eq } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/lib/db"
import { jobStageHistory, jobs } from "@/lib/db/schema"
import {
  buildAnalyticsOverview,
  type AnalyticsOverview,
} from "@/features/analytics/server/overview-helpers"

export const getAnalyticsOverview = cache(async function getAnalyticsOverview(
  userId: string,
): Promise<AnalyticsOverview> {
  const [jobRows, stageRows] = await Promise.all([
    db
      .select({
        source: jobs.source,
        status: jobs.status,
      })
      .from(jobs)
      .where(eq(jobs.userId, userId)),
    db
      .select({
        jobId: jobStageHistory.jobId,
        toStatus: jobStageHistory.toStatus,
      })
      .from(jobStageHistory)
      .innerJoin(jobs, eq(jobStageHistory.jobId, jobs.id))
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobStageHistory.changedAt)),
  ])

  return buildAnalyticsOverview(jobRows, stageRows)
})
