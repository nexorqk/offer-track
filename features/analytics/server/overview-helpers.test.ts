import { describe, expect, it } from "vitest"

import { buildAnalyticsOverview } from "@/features/analytics/server/overview-helpers"

describe("buildAnalyticsOverview", () => {
  it("computes funnel conversion from stage history reach counts", () => {
    const analytics = buildAnalyticsOverview(
      [
        { source: "LinkedIn", status: "applied" },
        { source: "LinkedIn", status: "offer" },
        { source: "Referral", status: "rejected" },
      ],
      [
        { jobId: "job-1", toStatus: "wishlist" },
        { jobId: "job-1", toStatus: "applied" },
        { jobId: "job-2", toStatus: "wishlist" },
        { jobId: "job-2", toStatus: "applied" },
        { jobId: "job-2", toStatus: "technical" },
        { jobId: "job-2", toStatus: "offer" },
        { jobId: "job-3", toStatus: "wishlist" },
        { jobId: "job-3", toStatus: "applied" },
        { jobId: "job-3", toStatus: "hr_screen" },
        { jobId: "job-3", toStatus: "rejected" },
      ],
    )

    expect(analytics.summary).toMatchObject({
      activeApplications: 1,
      interviewRate: 67,
      offerRate: 33,
      rejectionCount: 1,
      responseRate: 67,
      totalJobs: 3,
    })

    expect(
      analytics.funnel.map((entry) => ({
        conversionFromPrevious: entry.conversionFromPrevious,
        count: entry.count,
        status: entry.status,
      })),
    ).toEqual([
      { conversionFromPrevious: null, count: 3, status: "wishlist" },
      { conversionFromPrevious: 100, count: 3, status: "applied" },
      { conversionFromPrevious: 33, count: 1, status: "hr_screen" },
      { conversionFromPrevious: 100, count: 1, status: "technical" },
      { conversionFromPrevious: 0, count: 0, status: "final" },
      { conversionFromPrevious: null, count: 1, status: "offer" },
      { conversionFromPrevious: null, count: 1, status: "rejected" },
    ])
  })

  it("normalizes source breakdown and handles empty datasets", () => {
    const analytics = buildAnalyticsOverview(
      [
        { source: "", status: "wishlist" },
        { source: null, status: "wishlist" },
        { source: "Referral", status: "wishlist" },
      ],
      [],
    )

    expect(analytics.sourceBreakdown).toEqual([
      { count: 2, source: "Unknown" },
      { count: 1, source: "Referral" },
    ])
    expect(analytics.summary).toMatchObject({
      activeApplications: 3,
      interviewRate: 0,
      offerRate: 0,
      rejectionCount: 0,
      responseRate: 0,
      totalJobs: 3,
    })
  })
})
