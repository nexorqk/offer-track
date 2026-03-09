import type { PoolConfig } from "pg"

export function needsSsl(connectionString: string) {
  const host = new URL(connectionString).hostname

  if (host === "localhost" || host === "127.0.0.1") {
    return false
  }

  return !host.endsWith(".railway.internal")
}

export function createPoolConfig(
  connectionString: string,
  nodeEnv: string | undefined,
): PoolConfig {
  return {
    allowExitOnIdle: nodeEnv !== "production",
    connectionString,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    max: 5,
    maxLifetimeSeconds: 60 * 5,
    min: 0,
    ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : false,
  }
}
