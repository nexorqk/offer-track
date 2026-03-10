import { describe, expect, it } from "vitest"

import { parseJobListFilters } from "@/features/jobs/schemas/job-list"

describe("job list filters", () => {
  it("returns defaults for empty params", () => {
    expect(parseJobListFilters({})).toEqual({
      priority: "all",
      q: "",
      sort: "updated_desc",
      status: "all",
      view: "table",
      workMode: "all",
    })
  })

  it("normalizes valid params", () => {
    expect(
      parseJobListFilters({
        priority: "high",
        q: "  atlas ",
        sort: "salary_desc",
        status: "technical",
        view: "kanban",
        workMode: "remote",
      }),
    ).toEqual({
      priority: "high",
      q: "atlas",
      sort: "salary_desc",
      status: "technical",
      view: "kanban",
      workMode: "remote",
    })
  })

  it("falls back on invalid params", () => {
    expect(
      parseJobListFilters({
        priority: "urgent",
        q: ["atlas", "signal"],
        sort: "newest",
        status: "in_progress",
        view: "board",
        workMode: "distributed",
      }),
    ).toEqual({
      priority: "all",
      q: "",
      sort: "updated_desc",
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
      priority: "all",
      q: "",
      sort: "updated_desc",
      status: "all",
      view: "table",
      workMode: "all",
    })
  })
})
