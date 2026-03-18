import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockDbInsert,
  mockDbSelect,
  mockRedirect,
  mockRequireCurrentUser,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockDbInsert: vi.fn(),
  mockDbSelect: vi.fn(),
  mockRedirect: vi.fn(),
  mockRequireCurrentUser: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock("@/features/auth/server/auth", () => ({
  requireCurrentUser: mockRequireCurrentUser,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}))

vi.mock("@/lib/db", () => ({
  db: {
    insert: mockDbInsert,
    select: mockDbSelect,
  },
}))

import {
  createJobInterviewAction,
  createJobNoteAction,
} from "@/features/jobs/server/actions"
import { interviews, notes } from "@/lib/db/schema"

function createFormData(entries: Record<string, string>) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value)
  }

  return formData
}

function mockOwnedJob(job: { companyId: string; id: string } | null) {
  const limit = vi.fn().mockResolvedValue(job ? [job] : [])
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })

  mockDbSelect.mockReturnValue({ from })

  return {
    from,
    limit,
    where,
  }
}

function mockInterviewInsert() {
  const values = vi.fn().mockResolvedValue(undefined)

  mockDbInsert.mockReturnValue({ values })

  return {
    values,
  }
}

function mockNoteInsert() {
  const values = vi.fn().mockResolvedValue(undefined)

  mockDbInsert.mockReturnValue({ values })

  return {
    values,
  }
}

describe("createJobInterviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireCurrentUser.mockResolvedValue({
      email: "alex@example.com",
      id: "user-1",
    })
  })

  it("returns validation errors for an invalid interview payload", async () => {
    const result = await createJobInterviewAction(
      { status: "idle" },
      createFormData({
        durationMinutes: "forty five",
        jobId: "job-1",
        location: "",
        notes: "",
        result: "",
        scheduledAt: "",
        timezoneOffsetMinutes: "0",
        type: "technical",
      }),
    )

    expect(result.status).toBe("error")
    expect(result.message).toBe("Fix the highlighted fields and try again.")
    expect(result.fieldErrors?.scheduledAt).toContain(
      "Interview time is required",
    )
    expect(result.fieldErrors?.durationMinutes).toContain(
      "Enter a whole number",
    )
    expect(mockDbSelect).not.toHaveBeenCalled()
    expect(mockDbInsert).not.toHaveBeenCalled()
  })

  it("returns an error when the job no longer exists", async () => {
    mockOwnedJob(null)

    const result = await createJobInterviewAction(
      { status: "idle" },
      createFormData({
        durationMinutes: "45",
        jobId: "job-404",
        location: "Zoom",
        notes: "",
        result: "",
        scheduledAt: "2026-03-18T14:30",
        timezoneOffsetMinutes: "-180",
        type: "technical",
      }),
    )

    expect(result).toEqual({
      message: "This job no longer exists.",
      status: "error",
    })
    expect(mockDbInsert).not.toHaveBeenCalled()
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it("creates an interview and revalidates the affected pages", async () => {
    mockOwnedJob({
      companyId: "company-1",
      id: "job-1",
    })
    const insert = mockInterviewInsert()

    const result = await createJobInterviewAction(
      { status: "idle" },
      createFormData({
        durationMinutes: "45",
        jobId: "job-1",
        location: "  Zoom  ",
        notes: "  Bring architecture examples  ",
        result: "  Next round  ",
        scheduledAt: "2026-03-18T14:30",
        timezoneOffsetMinutes: "-180",
        type: "technical",
      }),
    )

    expect(mockDbInsert).toHaveBeenCalledWith(interviews)
    expect(insert.values).toHaveBeenCalledWith(
      expect.objectContaining({
        durationMinutes: 45,
        jobId: "job-1",
        location: "Zoom",
        notes: "Bring architecture examples",
        result: "Next round",
        type: "technical",
      }),
    )

    const insertedInterview = insert.values.mock.calls[0]?.[0]

    expect(insertedInterview.scheduledAt).toBeInstanceOf(Date)
    expect(insertedInterview.scheduledAt.toISOString()).toBe(
      "2026-03-18T11:30:00.000Z",
    )

    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/jobs/job-1")
    expect(result).toEqual({
      message: "Interview scheduled.",
      status: "success",
    })
  })
})

describe("createJobNoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireCurrentUser.mockResolvedValue({
      email: "alex@example.com",
      id: "user-1",
    })
  })

  it("returns validation errors when an internal note is marked public", async () => {
    const result = await createJobNoteAction(
      { status: "idle" },
      createFormData({
        content: "Candidate prep notes",
        jobId: "job-1",
        noteKind: "internal",
        visibilityProfile: "public_showcase",
      }),
    )

    expect(result.status).toBe("error")
    expect(result.message).toBe("Write a note before saving.")
    expect(result.fieldErrors?.visibilityProfile).toContain(
      "Only reflection and update notes can be published to the public showcase.",
    )
    expect(mockDbSelect).not.toHaveBeenCalled()
    expect(mockDbInsert).not.toHaveBeenCalled()
  })

  it("creates a public reflection note and revalidates the affected pages", async () => {
    mockOwnedJob({
      companyId: "company-1",
      id: "job-1",
    })
    const insert = mockNoteInsert()

    const result = await createJobNoteAction(
      { status: "idle" },
      createFormData({
        content: "  Strong product signal after the system design round.  ",
        jobId: "job-1",
        noteKind: "reflection",
        visibilityProfile: "public_showcase",
      }),
    )

    expect(mockDbInsert).toHaveBeenCalledWith(notes)
    expect(insert.values).toHaveBeenCalledWith({
      content: "Strong product signal after the system design round.",
      jobId: "job-1",
      noteKind: "reflection",
      userId: "user-1",
      visibilityProfile: "public_showcase",
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/jobs/job-1")
    expect(result).toEqual({
      message: "Note saved.",
      status: "success",
    })
  })
})
