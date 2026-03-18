import { describe, expect, it } from "vitest"

import { jobFormSchema } from "@/features/jobs/schemas/job"

describe("job form schema", () => {
  it("parses and normalizes a valid job payload", () => {
    const parsed = jobFormSchema.parse({
      appliedAt: "2026-03-10",
      companyName: "  Atlas Labs  ",
      currency: " eur ",
      description: "  Build product-facing frontend systems.  ",
      employmentType: " full-time ",
      location: " Remote, EU ",
      priority: "high",
      publicSummary: "  Leading product frontend work across the candidate journey.  ",
      salaryMax: "5500",
      salaryMin: "4500",
      source: " LinkedIn ",
      sourceUrl: "https://linkedin.com/jobs/view/123",
      status: "applied",
      title: " Senior Frontend Engineer ",
      visibilityProfile: "public_showcase",
      workMode: "remote",
    })

    expect(parsed).toMatchObject({
      companyName: "Atlas Labs",
      currency: "EUR",
      description: "Build product-facing frontend systems.",
      employmentType: "full-time",
      location: "Remote, EU",
      priority: "high",
      publicSummary: "Leading product frontend work across the candidate journey.",
      salaryMax: 5500,
      salaryMin: 4500,
      source: "LinkedIn",
      sourceUrl: "https://linkedin.com/jobs/view/123",
      status: "applied",
      title: "Senior Frontend Engineer",
      visibilityProfile: "public_showcase",
      workMode: "remote",
    })
    expect(parsed.appliedAt).toEqual(new Date("2026-03-10T00:00:00.000Z"))
  })

  it("accepts sparse payloads and strips empty strings", () => {
    const parsed = jobFormSchema.parse({
      appliedAt: "",
      companyName: "Northstar Health",
      currency: "",
      description: "",
      employmentType: "",
      location: "",
      priority: "",
      publicSummary: "",
      salaryMax: "",
      salaryMin: "",
      source: "",
      sourceUrl: "",
      status: "",
      title: "Platform Engineer",
      visibilityProfile: "",
      workMode: "",
    })

    expect(parsed).toMatchObject({
      companyName: "Northstar Health",
      currency: undefined,
      description: undefined,
      employmentType: undefined,
      location: undefined,
      priority: "medium",
      publicSummary: undefined,
      salaryMax: undefined,
      salaryMin: undefined,
      source: undefined,
      sourceUrl: undefined,
      status: "wishlist",
      title: "Platform Engineer",
      visibilityProfile: "private",
      workMode: undefined,
    })
    expect(parsed.appliedAt).toBeUndefined()
  })

  it("rejects invalid salary ranges", () => {
    const result = jobFormSchema.safeParse({
      companyName: "Signal Forge",
      salaryMin: "6500",
      salaryMax: "5000",
      title: "Frontend Lead",
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.path[0] === "salaryMax" &&
            issue.message ===
              "Maximum salary must be greater than or equal to minimum salary",
        ),
      ).toBe(true)
    }
  })

  it("rejects invalid urls", () => {
    const result = jobFormSchema.safeParse({
      companyName: "Signal Forge",
      sourceUrl: "not-a-url",
      title: "Frontend Lead",
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.sourceUrl).toContain(
        "Enter a valid source URL",
      )
    }
  })
})
