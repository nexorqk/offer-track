import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}))

import { buildContactsPageData } from "@/features/contacts/server/queries"

function createRow(
  overrides: Partial<Parameters<typeof buildContactsPageData>[0][number]> = {},
) {
  return {
    companyId: "company-1",
    companyName: "Atlas Labs",
    createdAt: new Date("2026-03-01T09:00:00.000Z"),
    email: "marta@atlaslabs.dev",
    id: "contact-1",
    jobId: "job-1",
    jobTitle: "Frontend Engineer",
    linkedinUrl: "https://linkedin.com/in/marta",
    name: "Marta Schulz",
    notes: "Shared the interview loop.",
    role: "Engineering Manager",
    updatedAt: new Date("2026-03-08T09:00:00.000Z"),
    ...overrides,
  }
}

describe("buildContactsPageData", () => {
  it("sorts contacts by freshness and computes summary counts", () => {
    const result = buildContactsPageData([
      createRow(),
      createRow({
        companyId: "company-2",
        companyName: "Northstar Health",
        id: "contact-2",
        jobId: null,
        jobTitle: null,
        name: "Piotr Zielinski",
        updatedAt: new Date("2026-03-10T12:00:00.000Z"),
      }),
    ])

    expect(result.summary).toEqual({
      companies: 2,
      linkedJobs: 1,
      totalContacts: 2,
    })

    expect(result.items.map((contact) => contact.id)).toEqual([
      "contact-2",
      "contact-1",
    ])
  })

  it("keeps optional fields nullable for standalone company contacts", () => {
    const result = buildContactsPageData([
      createRow({
        email: null,
        jobId: null,
        jobTitle: null,
        linkedinUrl: null,
        notes: null,
        role: null,
      }),
    ])

    expect(result.items).toEqual([
      expect.objectContaining({
        email: null,
        jobId: null,
        jobTitle: null,
        linkedinUrl: null,
        notes: null,
        role: null,
      }),
    ])
  })
})
