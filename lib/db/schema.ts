import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const offerStatus = pgEnum("offer_status", [
  "draft",
  "applied",
  "interview",
  "offer",
  "rejected",
  "accepted",
]);

export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  status: offerStatus("status").notNull().default("draft"),
  link: text("link"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
