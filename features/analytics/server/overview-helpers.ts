const ACTIVE_STATUSES = new Set([
  "wishlist",
  "applied",
  "hr_screen",
  "technical",
  "final",
])
const RESPONSE_STATUSES = new Set([
  "hr_screen",
  "technical",
  "final",
  "offer",
  "rejected",
])
export const FUNNEL_STATUSES = [
  "wishlist",
  "applied",
  "hr_screen",
  "technical",
  "final",
  "offer",
  "rejected",
] as const
const TERMINAL_STATUSES = new Set(["offer", "rejected"])

export type AnalyticsJobRow = {
  source: string | null
  status: (typeof FUNNEL_STATUSES)[number]
}

export type AnalyticsStageRow = {
  jobId: string
  toStatus: (typeof FUNNEL_STATUSES)[number]
}

export type AnalyticsOverview = {
  funnel: Array<{
    conversionFromPrevious: number | null
    count: number
    status: (typeof FUNNEL_STATUSES)[number]
  }>
  sourceBreakdown: Array<{
    count: number
    source: string
  }>
  summary: {
    activeApplications: number
    offerRate: number
    responseRate: number
    totalJobs: number
  }
}

export function buildAnalyticsOverview(
  jobRows: AnalyticsJobRow[],
  stageRows: AnalyticsStageRow[],
): AnalyticsOverview {
  const totalJobs = jobRows.length
  const appliedJobs = jobRows.filter((job) => job.status !== "wishlist")
  const responseRateBase = appliedJobs.length
  const respondedJobs = appliedJobs.filter((job) => RESPONSE_STATUSES.has(job.status))
  const offers = jobRows.filter((job) => job.status === "offer").length

  const jobsReachedByStatus = new Map<
    (typeof FUNNEL_STATUSES)[number],
    Set<string>
  >(FUNNEL_STATUSES.map((status) => [status, new Set<string>()]))

  for (const row of stageRows) {
    jobsReachedByStatus.get(row.toStatus)?.add(row.jobId)
  }

  const funnel = FUNNEL_STATUSES.map((status, index) => {
    const count = jobsReachedByStatus.get(status)?.size ?? 0
    const previousStatus = FUNNEL_STATUSES[index - 1]
    const previousCount = previousStatus
      ? jobsReachedByStatus.get(previousStatus)?.size ?? 0
      : 0

    const conversionFromPrevious =
      index === 0 || TERMINAL_STATUSES.has(status)
        ? null
        : previousCount === 0
          ? 0
          : Math.round((count / previousCount) * 100)

    return {
      conversionFromPrevious,
      count,
      status,
    }
  })

  const sourceCounts = new Map<string, number>()

  for (const row of jobRows) {
    const source = row.source?.trim() || "Unknown"
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1)
  }

  return {
    funnel,
    sourceBreakdown: [...sourceCounts.entries()]
      .map(([source, count]) => ({
        count,
        source,
      }))
      .toSorted((left, right) => right.count - left.count),
    summary: {
      activeApplications: jobRows.filter((job) => ACTIVE_STATUSES.has(job.status))
        .length,
      offerRate:
        responseRateBase === 0 ? 0 : Math.round((offers / responseRateBase) * 100),
      responseRate:
        responseRateBase === 0
          ? 0
          : Math.round((respondedJobs.length / responseRateBase) * 100),
      totalJobs,
    },
  }
}
