import { describe, expect, it } from "vitest"

import {
  hashPassword,
  verifyPassword,
} from "@/features/auth/server/password"

describe("password helpers", () => {
  it("hashes and verifies a password", async () => {
    const password = "correct horse battery staple"
    const hash = await hashPassword(password)

    await expect(verifyPassword(password, hash)).resolves.toBe(true)
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false)
  })

  it("produces distinct hashes for the same password", async () => {
    const password = "same-password"

    const [firstHash, secondHash] = await Promise.all([
      hashPassword(password),
      hashPassword(password),
    ])

    expect(firstHash).not.toBe(secondHash)
  })
})
