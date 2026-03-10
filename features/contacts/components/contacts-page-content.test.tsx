import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ContactsPageContent } from "@/features/contacts/components/contacts-page-content"

describe("ContactsPageContent", () => {
  it("renders the empty state", () => {
    render(
      <ContactsPageContent
        items={[]}
        summary={{
          companies: 0,
          linkedJobs: 0,
          totalContacts: 0,
        }}
      />,
    )

    expect(
      screen.getByText("No contacts tracked yet. Add recruiters or hiring managers from a job detail page."),
    ).toBeInTheDocument()
  })

  it("renders contacts with company and optional job links", () => {
    render(
      <ContactsPageContent
        items={[
          {
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
          },
        ]}
        summary={{
          companies: 1,
          linkedJobs: 1,
          totalContacts: 1,
        }}
      />,
    )

    expect(screen.getByText("Marta Schulz")).toBeInTheDocument()
    expect(screen.getByText("Engineering Manager")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Atlas Labs" })).toHaveAttribute(
      "href",
      "/companies#company-company-1",
    )
    expect(screen.getByRole("link", { name: "Frontend Engineer" })).toHaveAttribute(
      "href",
      "/jobs/job-1",
    )
  })
})
