import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/lib/env";
import { createPoolConfig } from "@/lib/db/pool-config";
import * as schema from "@/lib/db/schema";

declare global {
  var __offerTrackPool: Pool | undefined;
}

const pool =
  globalThis.__offerTrackPool ??
  new Pool(createPoolConfig(env.DATABASE_URL, process.env.NODE_ENV));

pool.on("error", (error) => {
  console.error("Unexpected Postgres pool error", error);
});

if (process.env.NODE_ENV !== "production") {
  globalThis.__offerTrackPool = pool;
}

export const db = drizzle(pool, { schema });

export type Database = typeof db;
