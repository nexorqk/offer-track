import { describe, expect, it } from "vitest"

import {
  applyUndoJobStatusMove,
  buildOptimisticJobStatusMove,
} from "@/features/jobs/components/jobs-kanban-board-state"
import type { JobListItem } from "@/features/jobs/types/job"

function createJob(overrides: Partial<JobListItem> = {}): JobListItem {
  return {
    appliedAt: new Date("2026-03-01T09:00:00.000Z"),
    companyName: "Atlas Labs",
    id: "job-1",
    location: "Remote, EU",
    priority: "high",
    salaryMax: 6500,
    salaryMin: 4500,
    status: "applied",
    title: "Senior Frontend Engineer",
    updatedAt: new Date("2026-03-01T12:00:00.000Z"),
    workMode: "remote",
    ...overrides,
  }
}

describe("jobs kanban board state helpers", () => {
  it("builds an optimistic move with undo metadata", () => {
    const changedAt = new Date("2026-03-12T10:00:00.000Z")
    const result = buildOptimisticJobStatusMove(
      [createJob(), createJob({ id: "job-2", status: "wishlist", title: "Platform Engineer" })],
      "job-1",
      "technical",
      changedAt,
    )

    expect(result).not.toBeNull()

    if (!result) {
      return
    }

    expect(result.undoMove).toEqual({
      jobId: "job-1",
      jobTitle: "Senior Frontend Engineer",
      nextStatus: "technical",
      previousStatus: "applied",
    })
    expect(result.updatedJobs[0]).toMatchObject({
      id: "job-1",
      status: "technical",
      updatedAt: changedAt,
    })
    expect(result.updatedJobs[1]?.status).toBe("wishlist")
  })

  it("reverts a move back to the previous status", () => {
    const changedAt = new Date("2026-03-12T10:05:00.000Z")
    const reverted = applyUndoJobStatusMove(
      [createJob({ status: "technical" })],
      {
        jobId: "job-1",
        jobTitle: "Senior Frontend Engineer",
        nextStatus: "technical",
        previousStatus: "applied",
      },
      changedAt,
    )

    expect(reverted).toEqual([
      expect.objectContaining({
        id: "job-1",
        status: "applied",
        updatedAt: changedAt,
      }),
    ])
  })

  it("ignores moves for missing jobs or unchanged statuses", () => {
    expect(
      buildOptimisticJobStatusMove([createJob()], "job-404", "technical"),
    ).toBeNull()
    expect(
      buildOptimisticJobStatusMove([createJob()], "job-1", "applied"),
    ).toBeNull()
  })
})
