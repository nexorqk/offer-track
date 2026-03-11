import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

vi.mock("@/features/tasks/server/actions", () => ({
  initialTaskToggleState: { status: "idle" },
  toggleTaskCompletionAction: vi.fn(async () => ({ status: "idle" })),
}))

import { TasksPageContent } from "@/features/tasks/components/tasks-page-content"

describe("TasksPageContent", () => {
  it("renders the overdue empty state", () => {
    render(
      <TasksPageContent
        filter="overdue"
        items={[]}
        summary={{
          completed: 0,
          open: 0,
          overdue: 0,
          total: 0,
        }}
      />,
    )

    expect(
      screen.getByText("Nothing overdue. Current follow-ups are on track."),
    ).toBeInTheDocument()
  })

  it("renders task rows with linked jobs and completion controls", () => {
    render(
      <TasksPageContent
        filter="open"
        items={[
          {
            companyName: "Atlas Labs",
            completed: false,
            createdAt: new Date("2026-03-10T08:00:00.000Z"),
            dueDate: new Date("2026-03-12T00:00:00.000Z"),
            id: "task-1",
            isOverdue: false,
            jobId: "job-1",
            jobTitle: "Senior Platform Engineer",
            title: "Send recruiter follow-up",
            updatedAt: new Date("2026-03-10T08:00:00.000Z"),
          },
        ]}
        summary={{
          completed: 0,
          open: 1,
          overdue: 0,
          total: 1,
        }}
      />,
    )

    expect(screen.getByText("Send recruiter follow-up")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Senior Platform Engineer" })).toHaveAttribute(
      "href",
      "/jobs/job-1",
    )
    expect(screen.getByRole("button", { name: "Mark done" })).toBeInTheDocument()
  })
})
