import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockDbInsert,
  mockDbSelect,
  mockDbUpdate,
  mockRequireCurrentUser,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockDbInsert: vi.fn(),
  mockDbSelect: vi.fn(),
  mockDbUpdate: vi.fn(),
  mockRequireCurrentUser: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock("@/features/auth/server/auth", () => ({
  requireCurrentUser: mockRequireCurrentUser,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock("@/lib/db", () => ({
  db: {
    insert: mockDbInsert,
    select: mockDbSelect,
    update: mockDbUpdate,
  },
}))

import { updateJobStatusAction } from "@/features/jobs/server/actions"
import { jobs } from "@/lib/db/schema"

function mockExistingJob(job: { id: string; status: "applied" | "technical" }) {
  const limit = vi.fn().mockResolvedValue([job])
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })

  mockDbSelect.mockReturnValue({ from })
}

function mockJobStatusUpdate() {
  const where = vi.fn().mockResolvedValue(undefined)
  const set = vi.fn().mockReturnValue({ where })

  mockDbUpdate.mockReturnValue({ set })

  return {
    set,
    where,
  }
}

describe("updateJobStatusAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireCurrentUser.mockResolvedValue({
      email: "alex@example.com",
      id: "user-1",
    })
  })

  it("updates the job status without manually inserting stage history", async () => {
    mockExistingJob({
      id: "job-1",
      status: "applied",
    })
    const update = mockJobStatusUpdate()

    const result = await updateJobStatusAction({
      jobId: "job-1",
      status: "technical",
    })

    expect(mockDbUpdate).toHaveBeenCalledWith(jobs)
    expect(update.set).toHaveBeenCalledWith({
      status: "technical",
      updatedAt: expect.any(Date),
    })
    expect(mockDbInsert).not.toHaveBeenCalled()
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/jobs")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/jobs/job-1")
    expect(result).toEqual({
      status: "technical",
    })
  })

  it("skips the update when the status does not change", async () => {
    mockExistingJob({
      id: "job-1",
      status: "technical",
    })

    const result = await updateJobStatusAction({
      jobId: "job-1",
      status: "technical",
    })

    expect(mockDbUpdate).not.toHaveBeenCalled()
    expect(mockDbInsert).not.toHaveBeenCalled()
    expect(mockRevalidatePath).not.toHaveBeenCalled()
    expect(result).toEqual({
      status: "technical",
    })
  })
})
