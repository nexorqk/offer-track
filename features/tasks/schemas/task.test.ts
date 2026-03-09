import { describe, expect, it } from "vitest"

import { taskFormSchema } from "@/features/tasks/schemas/task"

describe("task form schema", () => {
  it("requires a title and parses an optional due date", () => {
    const parsed = taskFormSchema.parse({
      dueDate: "2026-03-18",
      title: "  Follow up with recruiter  ",
    })

    expect(parsed.title).toBe("Follow up with recruiter")
    expect(parsed.dueDate).toEqual(new Date("2026-03-18T00:00:00.000Z"))
  })

  it("rejects an invalid due date", () => {
    const result = taskFormSchema.safeParse({
      dueDate: "not-a-date",
      title: "Follow up",
    })

    expect(result.success).toBe(false)
  })
})
