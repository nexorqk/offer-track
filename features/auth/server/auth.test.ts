import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockCookies,
  mockDbInsert,
  mockDbSelect,
  mockWithDatabaseRetry,
} = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockDbInsert: vi.fn(),
  mockDbSelect: vi.fn(),
  mockWithDatabaseRetry: vi.fn(),
}))

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}))

vi.mock("react", () => ({
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}))

vi.mock("@/lib/db/retry", () => ({
  withDatabaseRetry: mockWithDatabaseRetry,
}))

vi.mock("@/lib/db", () => ({
  db: {
    delete: vi.fn(),
    insert: mockDbInsert,
    select: mockDbSelect,
  },
}))

import { getCurrentUser } from "@/features/auth/server/auth"
import { profiles } from "@/lib/db/schema"

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWithDatabaseRetry.mockImplementation(async (operation: () => Promise<unknown>) =>
      operation(),
    )
  })

  it("recreates a missing profile for an authenticated user", async () => {
    mockCookies.mockResolvedValue({
      delete: vi.fn(),
      get: vi.fn().mockReturnValue({ value: "session-token" }),
      set: vi.fn(),
    })

    const limit = vi.fn().mockResolvedValue([
      {
        email: "alex@example.com",
        id: "user-1",
        profileId: null,
      },
    ])
    const where = vi.fn().mockReturnValue({ limit })
    const leftJoin = vi.fn().mockReturnValue({ where })
    const innerJoin = vi.fn().mockReturnValue({ leftJoin })
    const from = vi.fn().mockReturnValue({ innerJoin })

    mockDbSelect.mockReturnValue({ from })

    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined)
    const values = vi.fn().mockReturnValue({ onConflictDoNothing })

    mockDbInsert.mockReturnValue({ values })

    await expect(getCurrentUser()).resolves.toEqual({
      email: "alex@example.com",
      id: "user-1",
    })

    expect(mockDbInsert).toHaveBeenCalledWith(profiles)
    expect(values).toHaveBeenCalledWith({
      email: "alex@example.com",
      id: "user-1",
    })
    expect(onConflictDoNothing).toHaveBeenCalledOnce()
  })
})
