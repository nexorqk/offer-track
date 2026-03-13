import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { JobsKanbanBoard } from "@/features/jobs/components/jobs-kanban-board"
import type { JobListItem } from "@/features/jobs/types/job"

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigationMocks.push,
  }),
}))

vi.mock("@/features/jobs/server/actions", () => ({
  updateJobStatusAction: vi.fn(),
}))

function createJob(): JobListItem {
  return {
    appliedAt: new Date("2026-03-10T09:00:00.000Z"),
    companyName: "Atlas Labs",
    id: "job-1",
    location: "Remote",
    priority: "high",
    salaryMax: 7000,
    salaryMin: 5000,
    status: "applied",
    title: "Frontend Engineer",
    updatedAt: new Date("2026-03-10T12:00:00.000Z"),
    workMode: "remote",
  }
}

describe("JobsKanbanBoard", () => {
  beforeEach(() => {
    navigationMocks.push.mockReset()
  })

  it("opens job details when clicking a card", async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <JobsKanbanBoard jobs={[createJob()]} />
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole("link", { name: "Open Frontend Engineer" }))

    expect(navigationMocks.push).toHaveBeenCalledWith("/jobs/job-1")
  })
})
