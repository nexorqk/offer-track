import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const jobStatus = pgEnum("job_status", [
  "wishlist",
  "applied",
  "hr_screen",
  "technical",
  "final",
  "offer",
  "rejected",
]);

export const workMode = pgEnum("work_mode", ["remote", "hybrid", "onsite"]);

export const interviewType = pgEnum("interview_type", [
  "hr",
  "technical",
  "final",
]);

export const visibilityProfile = pgEnum("visibility_profile", [
  "private",
  "shared",
  "public_showcase",
]);

export const noteKind = pgEnum("note_kind", [
  "internal",
  "reflection",
  "update",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),
    showcaseEnabled: boolean("showcase_enabled").notNull().default(false),
    showcaseSlug: text("showcase_slug"),
    showcaseTitle: text("showcase_title"),
    showcaseIntro: text("showcase_intro"),
    showcaseBio: text("showcase_bio"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("profiles_email_idx").on(table.email),
    uniqueIndex("profiles_showcase_slug_idx").on(table.showcaseSlug),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionTokenHash: text("session_token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("sessions_session_token_hash_idx").on(table.sessionTokenHash),
    index("sessions_user_id_idx").on(table.userId),
  ]
);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    nameKey: text("name_key").notNull(),
    website: text("website"),
    location: text("location"),
    industry: text("industry"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("companies_user_id_idx").on(table.userId),
    index("companies_name_idx").on(table.name),
    unique("companies_user_id_name_key_key").on(table.userId, table.nameKey),
  ]
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    source: text("source"),
    sourceUrl: text("source_url"),
    location: text("location"),
    employmentType: text("employment_type"),
    workMode: workMode("work_mode"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    currency: text("currency"),
    status: jobStatus("status").notNull().default("wishlist"),
    priority: text("priority").notNull().default("medium"),
    visibilityProfile: visibilityProfile("visibility_profile")
      .notNull()
      .default("private"),
    publicSummary: text("public_summary"),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("jobs_public_id_idx").on(table.publicId),
    index("jobs_user_id_idx").on(table.userId),
    index("jobs_company_id_idx").on(table.companyId),
    index("jobs_status_idx").on(table.status),
    index("jobs_visibility_profile_idx").on(table.visibilityProfile),
    index("jobs_applied_at_idx").on(table.appliedAt),
  ]
);

export const jobStageHistory = pgTable(
  "job_stage_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    fromStatus: jobStatus("from_status"),
    toStatus: jobStatus("to_status").notNull(),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("job_stage_history_job_id_idx").on(table.jobId),
    index("job_stage_history_changed_at_idx").on(table.changedAt),
  ]
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    role: text("role"),
    email: text("email"),
    linkedinUrl: text("linkedin_url"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("contacts_user_id_idx").on(table.userId),
    index("contacts_company_id_idx").on(table.companyId),
    index("contacts_job_id_idx").on(table.jobId),
  ]
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    noteKind: noteKind("note_kind").notNull().default("internal"),
    visibilityProfile: visibilityProfile("visibility_profile")
      .notNull()
      .default("private"),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notes_user_id_idx").on(table.userId),
    index("notes_job_id_idx").on(table.jobId),
    index("notes_visibility_profile_idx").on(table.visibilityProfile),
  ]
);

export const workspaceNotes = pgTable(
  "workspace_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("workspace_notes_user_id_idx").on(table.userId),
    index("workspace_notes_updated_at_idx").on(table.updatedAt),
  ]
);

export const interviews = pgTable(
  "interviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    type: interviewType("type").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes"),
    location: text("location"),
    result: text("result"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("interviews_job_id_idx").on(table.jobId),
    index("interviews_scheduled_at_idx").on(table.scheduledAt),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tasks_user_id_idx").on(table.userId),
    index("tasks_job_id_idx").on(table.jobId),
    index("tasks_completed_idx").on(table.completed),
    index("tasks_due_date_idx").on(table.dueDate),
  ]
);

export const usersRelations = relations(users, ({ many, one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.id],
  }),
  sessions: many(sessions),
}));

export const profilesRelations = relations(profiles, ({ many, one }) => ({
  companies: many(companies),
  contacts: many(contacts),
  notes: many(notes),
  tasks: many(tasks),
  workspaceNotes: many(workspaceNotes),
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many, one }) => ({
  contacts: many(contacts),
  jobs: many(jobs),
  profile: one(profiles, {
    fields: [companies.userId],
    references: [profiles.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ many, one }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  contacts: many(contacts),
  interviews: many(interviews),
  notes: many(notes),
  profile: one(profiles, {
    fields: [jobs.userId],
    references: [profiles.id],
  }),
  stageHistory: many(jobStageHistory),
  tasks: many(tasks),
}));

export const jobStageHistoryRelations = relations(jobStageHistory, ({ one }) => ({
  job: one(jobs, {
    fields: [jobStageHistory.jobId],
    references: [jobs.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  job: one(jobs, {
    fields: [contacts.jobId],
    references: [jobs.id],
  }),
  profile: one(profiles, {
    fields: [contacts.userId],
    references: [profiles.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  job: one(jobs, {
    fields: [notes.jobId],
    references: [jobs.id],
  }),
  profile: one(profiles, {
    fields: [notes.userId],
    references: [profiles.id],
  }),
}));

export const workspaceNotesRelations = relations(workspaceNotes, ({ one }) => ({
  profile: one(profiles, {
    fields: [workspaceNotes.userId],
    references: [profiles.id],
  }),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  job: one(jobs, {
    fields: [interviews.jobId],
    references: [jobs.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  job: one(jobs, {
    fields: [tasks.jobId],
    references: [jobs.id],
  }),
  profile: one(profiles, {
    fields: [tasks.userId],
    references: [profiles.id],
  }),
}));
