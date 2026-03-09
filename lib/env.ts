import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  DRIZZLE_DATABASE_URL: z.url().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DRIZZLE_DATABASE_URL: process.env.DRIZZLE_DATABASE_URL,
});
