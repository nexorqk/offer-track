import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { JobsTableView } from "@/features/jobs/components/jobs-table-view"
import type { JobListItem } from "@/features/jobs/types/job"

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigationMocks.push,
  }),
}))

function createJob(index: number): JobListItem {
  return {
    appliedAt: new Date(`2026-03-${String((index % 9) + 1).padStart(2, "0")}T09:00:00.000Z`),
    companyName: `Company ${index}`,
    id: `job-${index}`,
    location: "Remote, EU",
    priority: index % 2 === 0 ? "high" : "medium",
    salaryMax: 7000 + index * 100,
    salaryMin: 5000 + index * 100,
    status: index % 3 === 0 ? "technical" : "applied",
    title: `Role ${index}`,
    updatedAt: new Date(`2026-03-${String((index % 9) + 1).padStart(2, "0")}T12:00:00.000Z`),
    workMode: index % 2 === 0 ? "remote" : "hybrid",
  }
}

describe("JobsTableView", () => {
  beforeEach(() => {
    navigationMocks.push.mockReset()
  })

  it("renders a real table with pagination", async () => {
    const user = userEvent.setup()

    render(<JobsTableView jobs={Array.from({ length: 11 }, (_, index) => createJob(index + 1))} />)

    const table = screen.getByRole("table")

    expect(within(table).getByText("Role 1")).toBeInTheDocument()
    expect(within(table).queryByText("Role 11")).not.toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next page" }))

    expect(within(table).getByText("Role 11")).toBeInTheDocument()
    expect(within(table).queryByText("Role 1")).not.toBeInTheDocument()
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
  })

  it("lets the user hide optional columns locally", async () => {
    const user = userEvent.setup()

    render(<JobsTableView jobs={[createJob(1)]} />)

    const table = screen.getByRole("table")

    expect(within(table).getByText("Salary")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Columns" }))
    await user.click(screen.getByLabelText("Salary"))

    expect(within(table).queryByText("Salary")).not.toBeInTheDocument()
  })

  it("opens job details when clicking a row", async () => {
    const user = userEvent.setup()

    render(<JobsTableView jobs={[createJob(1)]} />)

    await user.click(screen.getByRole("link", { name: "Open Role 1" }))

    expect(navigationMocks.push).toHaveBeenCalledWith("/jobs/job-1")
  })
})
