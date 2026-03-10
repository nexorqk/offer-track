import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockDbSelect,
  mockDbUpdate,
  mockRequireCurrentUser,
  mockRevalidatePath,
} = vi.hoisted(() => ({
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
    select: mockDbSelect,
    update: mockDbUpdate,
  },
}))

import { toggleTaskCompletionAction } from "@/features/tasks/server/actions"
import { tasks } from "@/lib/db/schema"

function createFormData(entries: Record<string, string>) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value)
  }

  return formData
}

function mockOwnedTask(task: { id: string; jobId: string } | null) {
  const limit = vi.fn().mockResolvedValue(task ? [task] : [])
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })

  mockDbSelect.mockReturnValue({ from })

  return {
    from,
    limit,
    where,
  }
}

function mockTaskUpdate() {
  const where = vi.fn().mockResolvedValue(undefined)
  const set = vi.fn().mockReturnValue({ where })

  mockDbUpdate.mockReturnValue({ set })

  return {
    set,
    where,
  }
}

describe("toggleTaskCompletionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireCurrentUser.mockResolvedValue({
      email: "alex@example.com",
      id: "user-1",
    })
  })

  it("returns an error when the task identifier is missing", async () => {
    const result = await toggleTaskCompletionAction(
      { status: "idle" },
      createFormData({
        completed: "true",
      }),
    )

    expect(result).toEqual({
      message: "Task identifier is missing.",
      status: "error",
    })
    expect(mockDbSelect).not.toHaveBeenCalled()
    expect(mockDbUpdate).not.toHaveBeenCalled()
  })

  it("returns validation errors for an invalid completion flag", async () => {
    const result = await toggleTaskCompletionAction(
      { status: "idle" },
      createFormData({
        completed: "later",
        taskId: "task-1",
      }),
    )

    expect(result.status).toBe("error")
    expect(result.message).toBe("Fix the highlighted fields and try again.")
    expect(result.fieldErrors?.completed).toContain(
      "Select a valid completion state",
    )
    expect(mockDbSelect).not.toHaveBeenCalled()
    expect(mockDbUpdate).not.toHaveBeenCalled()
  })

  it("toggles the task state and revalidates affected pages", async () => {
    mockOwnedTask({
      id: "task-1",
      jobId: "job-1",
    })
    const update = mockTaskUpdate()

    const result = await toggleTaskCompletionAction(
      { status: "idle" },
      createFormData({
        completed: "true",
        taskId: "task-1",
      }),
    )

    expect(mockDbUpdate).toHaveBeenCalledWith(tasks)
    expect(update.set).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: true,
        updatedAt: expect.any(Date),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/jobs/job-1")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/tasks")
    expect(result).toEqual({
      message: "Task marked as done.",
      status: "success",
    })
  })
})
