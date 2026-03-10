import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CompaniesPageContent } from "@/features/companies/components/companies-page-content"

describe("CompaniesPageContent", () => {
  it("renders the empty state", () => {
    render(
      <CompaniesPageContent
        items={[]}
        summary={{
          activeJobs: 0,
          companies: 0,
          totalJobs: 0,
        }}
      />,
    )

    expect(
      screen.getByText("No companies tracked yet. The first saved job will start building this list."),
    ).toBeInTheDocument()
  })

  it("renders company cards with stage summary and jobs link", () => {
    render(
      <CompaniesPageContent
        items={[
          {
            averageStageLabel: "Applied",
            id: "company-1",
            industry: "Developer tooling",
            jobCount: 2,
            location: "Berlin, Germany",
            name: "Atlas Labs",
            openJobCount: 2,
            stageBreakdown: [
              { count: 1, label: "Wishlist", status: "wishlist" },
              { count: 1, label: "Applied", status: "applied" },
            ],
            website: "https://atlaslabs.dev",
          },
        ]}
        summary={{
          activeJobs: 2,
          companies: 1,
          totalJobs: 2,
        }}
      />,
    )

    expect(screen.getByText("Atlas Labs")).toBeInTheDocument()
    expect(screen.getByText("Average stage: Applied")).toBeInTheDocument()
    expect(screen.getByText("2 roles")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View jobs" })).toHaveAttribute(
      "href",
      "/jobs?q=Atlas%20Labs",
    )
  })
})
