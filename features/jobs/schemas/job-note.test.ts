import { describe, expect, it } from "vitest"

import { jobNoteFormSchema } from "@/features/jobs/schemas/job-note"

describe("job note form schema", () => {
  it("requires non-empty content and trims it", () => {
    expect(
      jobNoteFormSchema.parse({
        content: "  Strong signals after technical round  ",
      }),
    ).toEqual({
      content: "Strong signals after technical round",
    })
  })

  it("rejects empty content", () => {
    const result = jobNoteFormSchema.safeParse({
      content: "   ",
    })

    expect(result.success).toBe(false)
  })
})
