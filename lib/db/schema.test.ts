import { getTableColumns } from "drizzle-orm"
import { getTableConfig } from "drizzle-orm/pg-core"
import { describe, expect, it } from "vitest"

import {
  companies,
  contacts,
  interviews,
  jobStageHistory,
  noteKind,
  jobStatus,
  jobs,
  notes,
  profiles,
  tasks,
  visibilityProfile,
  workspaceNotes,
  workMode,
} from "@/lib/db/schema"

describe("database schema", () => {
  it("defines the expected job status enum values", () => {
    expect(jobStatus.enumValues).toEqual([
      "wishlist",
      "applied",
      "hr_screen",
      "technical",
      "final",
      "offer",
      "rejected",
    ])
  })

  it("defines the expected work mode enum values", () => {
    expect(workMode.enumValues).toEqual(["remote", "hybrid", "onsite"])
  })

  it("defines the expected showcase enum values", () => {
    expect(visibilityProfile.enumValues).toEqual([
      "private",
      "shared",
      "public_showcase",
    ])
    expect(noteKind.enumValues).toEqual(["internal", "reflection", "update"])
  })

  it("includes the core domain tables", () => {
    expect(Object.keys(getTableColumns(profiles))).toEqual([
      "id",
      "email",
      "fullName",
      "avatarUrl",
      "showcaseEnabled",
      "showcaseSlug",
      "showcaseTitle",
      "showcaseIntro",
      "showcaseBio",
      "createdAt",
    ])

    expect(Object.keys(getTableColumns(companies))).toEqual([
      "id",
      "userId",
      "name",
      "nameKey",
      "website",
      "location",
      "industry",
      "notes",
      "createdAt",
      "updatedAt",
    ])

    expect(Object.keys(getTableColumns(jobs))).toEqual([
      "id",
      "publicId",
      "userId",
      "companyId",
      "title",
      "source",
      "sourceUrl",
      "location",
      "employmentType",
      "workMode",
      "salaryMin",
      "salaryMax",
      "currency",
      "status",
      "priority",
      "visibilityProfile",
      "publicSummary",
      "appliedAt",
      "description",
      "createdAt",
      "updatedAt",
    ])

    expect(Object.keys(getTableColumns(notes))).toEqual([
      "id",
      "userId",
      "jobId",
      "noteKind",
      "visibilityProfile",
      "content",
      "createdAt",
      "updatedAt",
    ])

    expect(Object.keys(getTableColumns(workspaceNotes))).toEqual([
      "id",
      "userId",
      "title",
      "content",
      "createdAt",
      "updatedAt",
    ])
  })

  it("deduplicates company names per user with a normalized key", () => {
    const companyUniqueConstraintNames = getTableConfig(companies).uniqueConstraints.map(
      (constraint) => constraint.getName(),
    )

    expect(companyUniqueConstraintNames).toContain("companies_user_id_name_key_key")
  })

  it("defines the minimum foreign-key graph", () => {
    expect(getTableConfig(jobs).foreignKeys).toHaveLength(2)
    expect(getTableConfig(jobStageHistory).foreignKeys).toHaveLength(1)
    expect(getTableConfig(contacts).foreignKeys).toHaveLength(3)
    expect(getTableConfig(notes).foreignKeys).toHaveLength(2)
    expect(getTableConfig(interviews).foreignKeys).toHaveLength(1)
    expect(getTableConfig(tasks).foreignKeys).toHaveLength(2)
    expect(getTableConfig(workspaceNotes).foreignKeys).toHaveLength(1)
  })
})
