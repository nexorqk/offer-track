import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/lib/env";
import * as schema from "@/lib/db/schema";

declare global {
  var __offerTrackPool: Pool | undefined;
}

function needsSsl(connectionString: string) {
  const host = new URL(connectionString).hostname;

  if (host === "localhost" || host === "127.0.0.1") {
    return false;
  }

  return !host.endsWith(".railway.internal");
}

const pool =
  globalThis.__offerTrackPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    ssl: needsSsl(env.DATABASE_URL) ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__offerTrackPool = pool;
}

export const db = drizzle(pool, { schema });

export type Database = typeof db;
