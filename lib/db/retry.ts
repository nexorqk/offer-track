const RETRYABLE_DATABASE_ERROR_CODES = new Set([
  "ECONNRESET",
  "EPIPE",
  "ETIMEDOUT",
  "PROTOCOL_CONNECTION_LOST",
])

const RETRYABLE_DATABASE_MESSAGE_PATTERNS = [
  "connection terminated",
  "connection timeout",
  "read econnreset",
  "socket hang up",
]

export function isRetryableDatabaseError(error: unknown) {
  for (const candidate of getErrorChain(error)) {
    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "code" in candidate &&
      typeof candidate.code === "string" &&
      RETRYABLE_DATABASE_ERROR_CODES.has(candidate.code)
    ) {
      return true
    }

    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "message" in candidate &&
      typeof candidate.message === "string"
    ) {
      const normalizedMessage = candidate.message.toLowerCase()

      if (
        RETRYABLE_DATABASE_MESSAGE_PATTERNS.some((pattern) =>
          normalizedMessage.includes(pattern),
        )
      ) {
        return true
      }
    }
  }

  return false
}

export async function withDatabaseRetry<T>(operation: () => Promise<T>) {
  try {
    return await operation()
  } catch (error) {
    if (!isRetryableDatabaseError(error)) {
      throw error
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 150))
  return operation()
}

function getErrorChain(error: unknown) {
  const chain: unknown[] = []
  let current = error

  while (current) {
    chain.push(current)

    if (
      typeof current === "object" &&
      current !== null &&
      "cause" in current &&
      current.cause &&
      !chain.includes(current.cause)
    ) {
      current = current.cause
      continue
    }

    break
  }

  return chain
}
