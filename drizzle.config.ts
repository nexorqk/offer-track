import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const url = process.env.DRIZZLE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "Missing database connection string. Set DATABASE_URL or DRIZZLE_DATABASE_URL.",
  );
}

function needsSsl(connectionString: string) {
  const host = new URL(connectionString).hostname;

  if (host === "localhost" || host === "127.0.0.1") {
    return false;
  }

  return !host.endsWith(".railway.internal");
}

const parsed = new URL(url);

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    ssl: needsSsl(url) ? { rejectUnauthorized: false } : false,
  },
  strict: true,
  verbose: true,
});
