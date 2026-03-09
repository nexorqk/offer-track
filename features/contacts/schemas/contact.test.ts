import { describe, expect, it } from "vitest"

import { contactFormSchema } from "@/features/contacts/schemas/contact"

describe("contact form schema", () => {
  it("requires a contact name and normalizes optional fields", () => {
    const parsed = contactFormSchema.parse({
      email: " recruiter@example.com ",
      linkedinUrl: " https://linkedin.com/in/recruiter ",
      name: "  Jane Recruiter ",
      notes: "  Warm intro  ",
      role: "  Senior Recruiter ",
    })

    expect(parsed).toEqual({
      email: "recruiter@example.com",
      linkedinUrl: "https://linkedin.com/in/recruiter",
      name: "Jane Recruiter",
      notes: "Warm intro",
      role: "Senior Recruiter",
    })
  })

  it("rejects invalid email and linkedin url", () => {
    const result = contactFormSchema.safeParse({
      email: "not-an-email",
      linkedinUrl: "linkedin",
      name: "Jane Recruiter",
    })

    expect(result.success).toBe(false)
  })
})
