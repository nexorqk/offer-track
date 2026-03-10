import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}))

import { buildTasksPageData } from "@/features/tasks/server/queries"

function createTask(overrides: Partial<Parameters<typeof buildTasksPageData>[0][number]>) {
  return {
    companyName: "Atlas Labs",
    completed: false,
    createdAt: new Date("2026-03-10T08:00:00.000Z"),
    dueDate: null,
    id: "task-1",
    jobId: "job-1",
    jobTitle: "Platform Engineer",
    title: "Follow up",
    updatedAt: new Date("2026-03-10T08:00:00.000Z"),
    ...overrides,
  }
}

describe("buildTasksPageData", () => {
  it("computes counts and keeps open tasks ordered by urgency", () => {
    const now = new Date("2026-03-10T12:00:00.000Z")

    const result = buildTasksPageData(
      [
        createTask({
          dueDate: new Date("2026-03-09T00:00:00.000Z"),
          id: "task-overdue",
          title: "Follow up after recruiter screen",
        }),
        createTask({
          dueDate: new Date("2026-03-12T00:00:00.000Z"),
          id: "task-soon",
          title: "Prepare take-home checklist",
        }),
        createTask({
          completed: true,
          dueDate: new Date("2026-03-08T00:00:00.000Z"),
          id: "task-done",
          title: "Share availability",
          updatedAt: new Date("2026-03-10T10:00:00.000Z"),
        }),
        createTask({
          id: "task-no-due",
          title: "Reconnect in two weeks",
        }),
      ],
      "open",
      now,
    )

    expect(result.summary).toEqual({
      completed: 1,
      open: 3,
      overdue: 1,
      total: 4,
    })
    expect(result.items.map((item) => item.id)).toEqual([
      "task-overdue",
      "task-soon",
      "task-no-due",
    ])
    expect(result.items[0]?.isOverdue).toBe(true)
    expect(result.items[1]?.isOverdue).toBe(false)
  })

  it("filters completed and overdue views from the same dataset", () => {
    const now = new Date("2026-03-10T12:00:00.000Z")
    const items = [
      createTask({
        dueDate: new Date("2026-03-08T00:00:00.000Z"),
        id: "task-overdue",
        title: "Send recruiter follow-up",
      }),
      createTask({
        completed: true,
        dueDate: new Date("2026-03-11T00:00:00.000Z"),
        id: "task-completed",
        title: "Confirm onsite slot",
      }),
    ]

    expect(buildTasksPageData(items, "completed", now).items.map((item) => item.id)).toEqual([
      "task-completed",
    ])
    expect(buildTasksPageData(items, "overdue", now).items.map((item) => item.id)).toEqual([
      "task-overdue",
    ])
  })
})
