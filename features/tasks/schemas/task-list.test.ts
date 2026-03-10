import { describe, expect, it } from "vitest"

import { parseTaskListFilters } from "@/features/tasks/schemas/task-list"

describe("parseTaskListFilters", () => {
  it("defaults to the open filter", () => {
    expect(parseTaskListFilters({})).toEqual({
      status: "open",
    })

    expect(
      parseTaskListFilters({
        status: "not-real",
      }),
    ).toEqual({
      status: "open",
    })
  })

  it("keeps supported task filters from the URL state", () => {
    expect(
      parseTaskListFilters({
        status: "completed",
      }),
    ).toEqual({
      status: "completed",
    })

    expect(
      parseTaskListFilters({
        status: ["overdue"],
      }),
    ).toEqual({
      status: "overdue",
    })
  })
})
