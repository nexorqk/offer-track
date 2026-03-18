import { describe, expect, it } from "vitest"

import { jobNoteFormSchema } from "@/features/jobs/schemas/job-note"

describe("job note form schema", () => {
  it("requires non-empty content and trims it", () => {
    expect(
      jobNoteFormSchema.parse({
        content: "  Strong signals after technical round  ",
        noteKind: "reflection",
        visibilityProfile: "public_showcase",
      }),
    ).toEqual({
      content: "Strong signals after technical round",
      noteKind: "reflection",
      visibilityProfile: "public_showcase",
    })
  })

  it("rejects empty content", () => {
    const result = jobNoteFormSchema.safeParse({
      content: "   ",
    })

    expect(result.success).toBe(false)
  })

  it("rejects publishing internal notes to the public showcase", () => {
    const result = jobNoteFormSchema.safeParse({
      content: "Candidate prep notes",
      noteKind: "internal",
      visibilityProfile: "public_showcase",
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.visibilityProfile).toContain(
        "Only reflection and update notes can be published to the public showcase.",
      )
    }
  })
})
