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

import { createJobAction } from "@/features/jobs/server/actions"
import { companies } from "@/lib/db/schema"

function createFormData(entries: Record<string, string>) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value)
  }

  return formData
}

function mockMissingCompanyLookup() {
  const limit = vi.fn().mockResolvedValue([])
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })

  mockDbSelect.mockReturnValue({ from })
}

describe("createJobAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireCurrentUser.mockResolvedValue({
      email: "alex@example.com",
      id: "user-1",
    })
  })

  it("stores a normalized company key when creating a new company", async () => {
    mockMissingCompanyLookup()

    const companyReturning = vi.fn().mockResolvedValue([{ id: "company-1" }])
    const companyValues = vi.fn().mockReturnValue({ returning: companyReturning })
    const jobReturning = vi.fn().mockResolvedValue([{ id: "job-1" }])
    const jobValues = vi.fn().mockReturnValue({ returning: jobReturning })
    const historyValues = vi.fn().mockResolvedValue(undefined)

    mockDbInsert
      .mockReturnValueOnce({ values: companyValues })
      .mockReturnValueOnce({ values: jobValues })
      .mockReturnValueOnce({ values: historyValues })

    await createJobAction(
      { status: "idle" },
      createFormData({
        companyName: "  Atlas   Labs  ",
        title: "Senior Frontend Engineer",
      }),
    )

    expect(mockDbInsert).toHaveBeenNthCalledWith(1, companies)
    expect(companyValues).toHaveBeenCalledWith({
      name: "Atlas   Labs",
      nameKey: "atlas labs",
      userId: "user-1",
    })
    expect(mockRedirect).toHaveBeenCalledWith("/jobs?view=kanban")
  })

  it("persists public showcase fields when creating a job", async () => {
    mockMissingCompanyLookup()

    const companyReturning = vi.fn().mockResolvedValue([{ id: "company-1" }])
    const companyValues = vi.fn().mockReturnValue({ returning: companyReturning })
    const jobReturning = vi.fn().mockResolvedValue([{ id: "job-1" }])
    const jobValues = vi.fn().mockReturnValue({ returning: jobReturning })
    const historyValues = vi.fn().mockResolvedValue(undefined)

    mockDbInsert
      .mockReturnValueOnce({ values: companyValues })
      .mockReturnValueOnce({ values: jobValues })
      .mockReturnValueOnce({ values: historyValues })

    await createJobAction(
      { status: "idle" },
      createFormData({
        companyName: "Atlas Labs",
        publicSummary: "  Building candidate-facing product UX.  ",
        title: "Senior Frontend Engineer",
        visibilityProfile: "public_showcase",
      }),
    )

    expect(jobValues).toHaveBeenCalledWith(
      expect.objectContaining({
        publicSummary: "Building candidate-facing product UX.",
        visibilityProfile: "public_showcase",
      }),
    )
  })
})
