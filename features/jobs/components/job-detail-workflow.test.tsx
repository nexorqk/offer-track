import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { JobDetailWorkflow } from "@/app/(dashboard)/jobs/[id]/_components/job-detail-workflow"

vi.mock("@/features/jobs/server/actions", () => ({
  createJobContactAction: vi.fn(async () => ({ status: "idle" })),
  createJobInterviewAction: vi.fn(async () => ({ status: "idle" })),
  createJobNoteAction: vi.fn(async () => ({ status: "idle" })),
  createJobTaskAction: vi.fn(async () => ({ status: "idle" })),
}))

describe("JobDetailWorkflow", () => {
  it("renders the interviews panel and empty state", () => {
    render(
      <JobDetailWorkflow
        contacts={[]}
        interviews={[]}
        jobId="job-1"
        notes={[]}
        tasks={[]}
      />
    )

    expect(screen.getByText("Interviews")).toBeInTheDocument()
    expect(screen.getByLabelText("Type")).toBeInTheDocument()
    expect(screen.getByLabelText("Scheduled for")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add interview" })).toBeInTheDocument()
    expect(
      screen.getByText("No interviews scheduled for this role yet.")
    ).toBeInTheDocument()
  })

  it("renders scheduled interviews with details", () => {
    render(
      <JobDetailWorkflow
        contacts={[]}
        interviews={[
          {
            createdAt: new Date("2026-03-10T08:00:00.000Z"),
            durationMinutes: 45,
            id: "int-1",
            location: "Zoom",
            notes: "Bring architecture examples",
            result: "Advanced to onsite",
            scheduledAt: new Date("2026-03-18T11:30:00.000Z"),
            type: "technical",
            updatedAt: new Date("2026-03-10T08:00:00.000Z"),
          },
        ]}
        jobId="job-1"
        notes={[]}
        tasks={[]}
      />
    )

    expect(screen.getByText("Technical interview")).toBeInTheDocument()
    expect(screen.getByText("45 min")).toBeInTheDocument()
    expect(screen.getByText("Zoom")).toBeInTheDocument()
    expect(screen.getByText("Advanced to onsite")).toBeInTheDocument()
    expect(screen.getByText("Bring architecture examples")).toBeInTheDocument()
  })
})
