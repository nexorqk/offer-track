import { describe, expect, it } from "vitest"

import { interviewFormSchema } from "@/features/interviews/schemas/interview"

describe("interview form schema", () => {
  it("parses a scheduled interview into a UTC date using the submitted timezone offset", () => {
    const result = interviewFormSchema.safeParse({
      durationMinutes: "60",
      location: "  Zoom  ",
      notes: "  Bring architecture examples  ",
      result: "  Next round  ",
      scheduledAt: "2026-03-18T14:30",
      timezoneOffsetMinutes: "-180",
      type: "technical",
    })

    expect(result.success).toBe(true)

    if (!result.success) {
      return
    }

    expect(result.data).toMatchObject({
      durationMinutes: 60,
      location: "Zoom",
      notes: "Bring architecture examples",
      result: "Next round",
      type: "technical",
    })
    expect(result.data.scheduledAt.toISOString()).toBe("2026-03-18T11:30:00.000Z")
  })

  it("reports an invalid scheduled date and time", () => {
    const result = interviewFormSchema.safeParse({
      durationMinutes: "",
      location: "",
      notes: "",
      result: "",
      scheduledAt: "not-a-date",
      timezoneOffsetMinutes: "0",
      type: "hr",
    })

    expect(result.success).toBe(false)

    if (result.success) {
      return
    }

    expect(result.error.flatten().fieldErrors.scheduledAt).toContain(
      "Enter a valid interview date and time",
    )
  })

  it("requires duration to be a whole number when provided", () => {
    const result = interviewFormSchema.safeParse({
      durationMinutes: "45.5",
      location: "",
      notes: "",
      result: "",
      scheduledAt: "2026-03-18T14:30",
      timezoneOffsetMinutes: "0",
      type: "final",
    })

    expect(result.success).toBe(false)

    if (result.success) {
      return
    }

    expect(result.error.flatten().fieldErrors.durationMinutes).toContain(
      "Enter a whole number",
    )
  })
})
