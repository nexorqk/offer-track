import { getTableColumns } from "drizzle-orm"
import { getTableConfig } from "drizzle-orm/pg-core"
import { describe, expect, it } from "vitest"

import {
  companies,
  contacts,
  interviews,
  jobStageHistory,
  jobStatus,
  jobs,
  notes,
  profiles,
  tasks,
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

  it("includes the core domain tables", () => {
    expect(Object.keys(getTableColumns(profiles))).toEqual([
      "id",
      "email",
      "fullName",
      "avatarUrl",
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
      "appliedAt",
      "description",
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
  })
})
