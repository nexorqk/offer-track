import { describe, expect, it } from "vitest"

import {
  buildJobStageHistoryEntry,
  normalizeCompanyNameKey,
} from "@/features/jobs/server/job-write"

describe("job write helpers", () => {
  it("normalizes company names for case-insensitive matching", () => {
    expect(normalizeCompanyNameKey("  Atlas   Labs ")).toBe("atlas labs")
    expect(normalizeCompanyNameKey("Signal Forge")).toBe("signal forge")
  })

  it("creates a stage history entry when the status changes", () => {
    const changedAt = new Date("2026-03-09T12:00:00.000Z")

    expect(
      buildJobStageHistoryEntry({
        changedAt,
        jobId: "job-1",
        nextStatus: "technical",
        previousStatus: "hr_screen",
      }),
    ).toMatchObject({
      changedAt,
      fromStatus: "hr_screen",
      jobId: "job-1",
      toStatus: "technical",
    })
  })

  it("skips stage history when the status stays the same", () => {
    expect(
      buildJobStageHistoryEntry({
        changedAt: new Date("2026-03-09T12:00:00.000Z"),
        jobId: "job-1",
        nextStatus: "applied",
        previousStatus: "applied",
      }),
    ).toBeNull()
  })

  it("creates the initial stage entry for new jobs", () => {
    const changedAt = new Date("2026-03-09T12:00:00.000Z")

    expect(
      buildJobStageHistoryEntry({
        changedAt,
        jobId: "job-1",
        nextStatus: "wishlist",
        previousStatus: null,
      }),
    ).toMatchObject({
      changedAt,
      fromStatus: null,
      jobId: "job-1",
      toStatus: "wishlist",
    })
  })
})
