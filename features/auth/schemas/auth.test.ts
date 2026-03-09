import { describe, expect, it } from "vitest"

import { loginSchema, registerSchema } from "@/features/auth/schemas/auth"

describe("auth schemas", () => {
  it("normalizes email during login", () => {
    const parsed = loginSchema.parse({
      email: "  USER@Example.COM ",
      password: "password123",
    })

    expect(parsed.email).toBe("user@example.com")
  })

  it("requires matching passwords during registration", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "password456",
    })

    expect(result.success).toBe(false)

    if (result.success) {
      throw new Error("Expected registration schema to reject mismatched passwords")
    }

    expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
      "Passwords must match"
    )
  })
})
