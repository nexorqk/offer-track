import { describe, expect, it } from "vitest"

import { createPoolConfig, needsSsl } from "@/lib/db/pool-config"

describe("database pool config", () => {
  it("disables ssl for localhost", () => {
    expect(
      needsSsl("postgresql://postgres:postgres@127.0.0.1:5432/offer-track"),
    ).toBe(false)
  })

  it("enables ssl for public railway hosts", () => {
    expect(
      needsSsl(
        "postgresql://postgres:secret@yamanote.proxy.rlwy.net:29971/railway",
      ),
    ).toBe(true)
  })

  it("builds a resilient pool config for dev", () => {
    const config = createPoolConfig(
      "postgresql://postgres:secret@yamanote.proxy.rlwy.net:29971/railway",
      "development",
    )

    expect(config).toMatchObject({
      allowExitOnIdle: true,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
      max: 5,
      maxLifetimeSeconds: 60 * 5,
      min: 0,
      ssl: { rejectUnauthorized: false },
    })
  })
})
