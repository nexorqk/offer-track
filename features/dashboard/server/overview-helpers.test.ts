import { describe, expect, it } from "vitest"

import { buildDashboardSummary } from "@/features/dashboard/server/overview-helpers"

describe("buildDashboardSummary", () => {
  it("computes the v1 summary metrics from tracked jobs and interviews", () => {
    const summary = buildDashboardSummary(
      [
        { status: "wishlist" },
        { status: "applied" },
        { status: "technical" },
        { status: "offer" },
        { status: "rejected" },
      ],
      3,
    )

    expect(summary).toEqual({
      activeApplications: 3,
      interviews: 3,
      offers: 1,
      totalJobs: 5,
    })
  })

  it("returns zeroes for an empty dataset", () => {
    expect(buildDashboardSummary([], 0)).toEqual({
      activeApplications: 0,
      interviews: 0,
      offers: 0,
      totalJobs: 0,
    })
  })
})
