import { describe, expect, it, vi } from "vitest"

import {
  isRetryableDatabaseError,
  withDatabaseRetry,
} from "@/lib/db/retry"

describe("database retry helper", () => {
  it("recognizes retryable network errors", () => {
    expect(isRetryableDatabaseError({ code: "ECONNRESET" })).toBe(true)
    expect(isRetryableDatabaseError({ code: "ETIMEDOUT" })).toBe(true)
    expect(isRetryableDatabaseError({ code: "EPIPE" })).toBe(true)
    expect(isRetryableDatabaseError({ code: "23505" })).toBe(false)
  })

  it("recognizes nested retryable causes", () => {
    const error = new Error("query failed", {
      cause: new Error("Connection terminated due to connection timeout", {
        cause: Object.assign(new Error("reset"), { code: "ECONNRESET" }),
      }),
    })

    expect(isRetryableDatabaseError(error)).toBe(true)
  })

  it("retries once for retryable errors", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(Object.assign(new Error("reset"), { code: "ECONNRESET" }))
      .mockResolvedValueOnce("ok")

    await expect(withDatabaseRetry(operation)).resolves.toBe("ok")
    expect(operation).toHaveBeenCalledTimes(2)
  })

  it("does not retry non-retryable errors", async () => {
    const error = Object.assign(new Error("duplicate"), { code: "23505" })
    const operation = vi.fn<() => Promise<string>>().mockRejectedValue(error)

    await expect(withDatabaseRetry(operation)).rejects.toBe(error)
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it("retries nested timeout errors", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(
        new Error("query failed", {
          cause: new Error("Connection terminated due to connection timeout", {
            cause: new Error("Connection terminated unexpectedly"),
          }),
        }),
      )
      .mockResolvedValueOnce("ok")

    await expect(withDatabaseRetry(operation)).resolves.toBe("ok")
    expect(operation).toHaveBeenCalledTimes(2)
  })
})
