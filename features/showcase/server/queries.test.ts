import { describe, expect, it } from "vitest"

import { computePublicShowcaseMetrics } from "@/features/showcase/server/query-helpers"

describe("showcase queries helpers", () => {
  it("computes public showcase metrics from published jobs and reflections", () => {
    expect(
      computePublicShowcaseMetrics(
        [
          { status: "wishlist" },
          { status: "applied" },
          { status: "technical" },
          { status: "offer" },
          { status: "rejected" },
        ],
        3,
      ),
    ).toEqual({
      activeApplications: 3,
      offers: 1,
      reflections: 3,
      totalPublicJobs: 5,
    })
  })
})
