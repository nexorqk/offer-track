import { describe, expect, it } from "vitest"

import {
  hasActiveJobListFilters,
  parseJobListFilters,
} from "@/features/jobs/schemas/job-list"

describe("job list filters", () => {
  it("returns defaults for empty params", () => {
    expect(parseJobListFilters({})).toEqual({
      appliedFrom: "",
      appliedTo: "",
      priority: "all",
      q: "",
      salaryMax: "",
      salaryMin: "",
      sort: "updated_desc",
      source: "",
      status: "all",
      view: "table",
      workMode: "all",
    })
  })

  it("normalizes valid params", () => {
    expect(
      parseJobListFilters({
        appliedFrom: "2026-03-01",
        appliedTo: "2026-03-31",
        priority: "high",
        q: "  atlas ",
        salaryMax: " 6500 ",
        salaryMin: " 4500 ",
        sort: "salary_desc",
        source: "  LinkedIn  ",
        status: "technical",
        view: "kanban",
        workMode: "remote",
      }),
    ).toEqual({
      appliedFrom: "2026-03-01",
      appliedTo: "2026-03-31",
      priority: "high",
      q: "atlas",
      salaryMax: "6500",
      salaryMin: "4500",
      sort: "salary_desc",
      source: "LinkedIn",
      status: "technical",
      view: "kanban",
      workMode: "remote",
    })
  })

  it("falls back on invalid params", () => {
    expect(
      parseJobListFilters({
        appliedFrom: "2026/03/01",
        appliedTo: "not-a-date",
        priority: "urgent",
        q: ["atlas", "signal"],
        salaryMax: "-2000",
        salaryMin: "forty",
        sort: "newest",
        source: ["linkedin", "referral"],
        status: "in_progress",
        view: "board",
        workMode: "distributed",
      }),
    ).toEqual({
      appliedFrom: "",
      appliedTo: "",
      priority: "all",
      q: "",
      salaryMax: "",
      salaryMin: "",
      sort: "updated_desc",
      source: "",
      status: "all",
      view: "table",
      workMode: "all",
    })
  })

  it("maps the legacy list view to table", () => {
    expect(
      parseJobListFilters({
        view: "list",
      }),
    ).toEqual({
      appliedFrom: "",
      appliedTo: "",
      priority: "all",
      q: "",
      salaryMax: "",
      salaryMin: "",
      sort: "updated_desc",
      source: "",
      status: "all",
      view: "table",
      workMode: "all",
    })
  })

  it("does not treat the selected view as an active filter", () => {
    expect(
      hasActiveJobListFilters({
        appliedFrom: "",
        appliedTo: "",
        priority: "all",
        q: "",
        salaryMax: "",
        salaryMin: "",
        sort: "updated_desc",
        source: "",
        status: "all",
        view: "kanban",
        workMode: "all",
      }),
    ).toBe(false)
  })
})
