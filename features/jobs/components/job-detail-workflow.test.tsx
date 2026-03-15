import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { JobDetailWorkflow } from "@/app/(dashboard)/jobs/[id]/_components/job-detail-workflow"

type MockJobDetailActionResult = {
  message?: string
  status: "error" | "idle" | "success"
}

const actionMocks = vi.hoisted(() => ({
  createJobContactAction: vi.fn<
    (_state: unknown, _formData: FormData) => Promise<MockJobDetailActionResult>
  >(
    async (_state: unknown, _formData: FormData) => ({ status: "idle" }),
  ),
  createJobInterviewAction: vi.fn<
    (_state: unknown, _formData: FormData) => Promise<MockJobDetailActionResult>
  >(
    async (_state: unknown, _formData: FormData) => ({ status: "idle" }),
  ),
  createJobNoteAction: vi.fn<
    (_state: unknown, _formData: FormData) => Promise<MockJobDetailActionResult>
  >(
    async (_state: unknown, _formData: FormData) => ({ status: "idle" }),
  ),
  createJobTaskAction: vi.fn<
    (_state: unknown, _formData: FormData) => Promise<MockJobDetailActionResult>
  >(
    async (_state: unknown, _formData: FormData) => ({ status: "idle" }),
  ),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

vi.mock("@/features/jobs/server/actions", () => ({
  createJobContactAction: actionMocks.createJobContactAction,
  createJobInterviewAction: actionMocks.createJobInterviewAction,
  createJobNoteAction: actionMocks.createJobNoteAction,
  createJobTaskAction: actionMocks.createJobTaskAction,
}))

describe("JobDetailWorkflow", () => {
  beforeEach(() => {
    window.localStorage.clear()
    actionMocks.createJobContactAction.mockClear()
    actionMocks.createJobInterviewAction.mockClear()
    actionMocks.createJobNoteAction.mockClear()
    actionMocks.createJobTaskAction.mockClear()
  })

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

  it("shows client-side validation for contact, interview, and task forms", async () => {
    const user = userEvent.setup()

    render(
      <JobDetailWorkflow
        contacts={[]}
        interviews={[]}
        jobId="job-1"
        notes={[]}
        tasks={[]}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Add contact" }))
    await user.click(screen.getByRole("button", { name: "Add interview" }))
    await user.click(screen.getByRole("button", { name: "Add task" }))

    expect(actionMocks.createJobContactAction).not.toHaveBeenCalled()
    expect(actionMocks.createJobInterviewAction).not.toHaveBeenCalled()
    expect(actionMocks.createJobTaskAction).not.toHaveBeenCalled()

    expect(screen.getByText("Contact name is required")).toBeInTheDocument()
    expect(screen.getByText("Interview time is required")).toBeInTheDocument()
    expect(screen.getByText("Task title is required")).toBeInTheDocument()
  })

  it("submits a valid contact form to the action", async () => {
    const user = userEvent.setup()

    render(
      <JobDetailWorkflow
        contacts={[]}
        interviews={[]}
        jobId="job-1"
        notes={[]}
        tasks={[]}
      />,
    )

    await user.type(screen.getByLabelText("Name"), "Jane Recruiter")
    await user.type(screen.getByLabelText("Email"), "jane@company.com")
    await user.click(screen.getByRole("button", { name: "Add contact" }))

    await waitFor(() => expect(actionMocks.createJobContactAction).toHaveBeenCalledTimes(1))

    const submittedFormData = actionMocks.createJobContactAction.mock.calls[0]?.[1] as
      | FormData
      | undefined

    expect(submittedFormData).toBeInstanceOf(FormData)

    if (!submittedFormData) {
      return
    }

    expect(submittedFormData.get("jobId")).toBe("job-1")
    expect(submittedFormData.get("name")).toBe("Jane Recruiter")
    expect(submittedFormData.get("email")).toBe("jane@company.com")
  })

  it("shows a toast after a successful contact save", async () => {
    const user = userEvent.setup()

    actionMocks.createJobContactAction.mockResolvedValueOnce({
      message: "Recruiter contact added.",
      status: "success",
    })

    render(
      <JobDetailWorkflow
        contacts={[]}
        interviews={[]}
        jobId="job-1"
        notes={[]}
        tasks={[]}
      />,
    )

    await user.type(screen.getByLabelText("Name"), "Jane Recruiter")
    await user.type(screen.getByLabelText("Email"), "jane@company.com")
    await user.click(screen.getByRole("button", { name: "Add contact" }))

    await waitFor(() =>
      expect(screen.getByText("Recruiter contact added.")).toBeInTheDocument(),
    )
  })

  it("restores an autosaved note draft after remount", async () => {
    vi.useFakeTimers()

    const { unmount } = render(
      <JobDetailWorkflow
        contacts={[]}
        interviews={[]}
        jobId="job-1"
        notes={[]}
        tasks={[]}
      />,
    )

    fireEvent.change(screen.getByLabelText("New note"), {
      target: {
        value: "Remember comp band and panel names",
      },
    })
    act(() => {
      vi.advanceTimersByTime(800)
    })

    unmount()

    render(
      <JobDetailWorkflow
        contacts={[]}
        interviews={[]}
        jobId="job-1"
        notes={[]}
        tasks={[]}
      />,
    )

    vi.useRealTimers()

    await waitFor(() =>
      expect(screen.getByLabelText("New note")).toHaveValue(
        "Remember comp band and panel names",
      ),
    )
  })
})
