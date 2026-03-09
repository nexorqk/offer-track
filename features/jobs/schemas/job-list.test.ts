import { describe, expect, it } from "vitest"

import { parseJobListFilters } from "@/features/jobs/schemas/job-list"

describe("job list filters", () => {
  it("returns defaults for empty params", () => {
    expect(parseJobListFilters({})).toEqual({
      q: "",
      sort: "updated_desc",
      status: "all",
    })
  })

  it("normalizes valid params", () => {
    expect(
      parseJobListFilters({
        q: "  atlas ",
        sort: "salary_desc",
        status: "technical",
      }),
    ).toEqual({
      q: "atlas",
      sort: "salary_desc",
      status: "technical",
    })
  })

  it("falls back on invalid params", () => {
    expect(
      parseJobListFilters({
        q: ["atlas", "signal"],
        sort: "newest",
        status: "in_progress",
      }),
    ).toEqual({
      q: "",
      sort: "updated_desc",
      status: "all",
    })
  })
})
