import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}))

import { buildCompaniesPageData } from "@/features/companies/server/queries"

function createRow(
  overrides: Partial<Parameters<typeof buildCompaniesPageData>[0][number]>,
) {
  return {
    companyId: "company-1",
    companyIndustry: "Developer tooling",
    companyLocation: "Berlin, Germany",
    companyName: "Atlas Labs",
    companyUpdatedAt: new Date("2026-03-10T08:00:00.000Z"),
    companyWebsite: "https://atlaslabs.dev",
    jobId: null,
    jobStatus: null,
    jobUpdatedAt: null,
    ...overrides,
  }
}

describe("buildCompaniesPageData", () => {
  it("groups jobs per company and computes stage summary", () => {
    const result = buildCompaniesPageData([
      createRow({
        jobId: "job-1",
        jobStatus: "wishlist",
        jobUpdatedAt: new Date("2026-03-08T09:00:00.000Z"),
      }),
      createRow({
        jobId: "job-2",
        jobStatus: "applied",
        jobUpdatedAt: new Date("2026-03-09T09:00:00.000Z"),
      }),
      createRow({
        companyId: "company-2",
        companyIndustry: "Healthtech",
        companyLocation: "Warsaw, Poland",
        companyName: "Northstar Health",
        companyUpdatedAt: new Date("2026-03-05T12:00:00.000Z"),
        companyWebsite: "https://northstar.health",
        jobId: "job-3",
        jobStatus: "technical",
        jobUpdatedAt: new Date("2026-03-10T10:00:00.000Z"),
      }),
    ])

    expect(result.summary).toEqual({
      activeJobs: 3,
      companies: 2,
      totalJobs: 3,
    })

    expect(result.items).toEqual([
      expect.objectContaining({
        averageStageLabel: "Applied",
        id: "company-1",
        jobCount: 2,
        name: "Atlas Labs",
        openJobCount: 2,
        stageBreakdown: [
          { count: 1, label: "Wishlist", status: "wishlist" },
          { count: 1, label: "Applied", status: "applied" },
        ],
      }),
      expect.objectContaining({
        averageStageLabel: "Technical",
        id: "company-2",
        jobCount: 1,
        name: "Northstar Health",
        openJobCount: 1,
        stageBreakdown: [{ count: 1, label: "Technical", status: "technical" }],
      }),
    ])
  })

  it("keeps companies without jobs and marks their stage as empty", () => {
    const result = buildCompaniesPageData([
      createRow({
        companyId: "company-empty",
        companyName: "Signal Forge",
        companyWebsite: "https://signalforge.com",
      }),
    ])

    expect(result.summary).toEqual({
      activeJobs: 0,
      companies: 1,
      totalJobs: 0,
    })

    expect(result.items).toEqual([
      expect.objectContaining({
        averageStageLabel: null,
        id: "company-empty",
        jobCount: 0,
        name: "Signal Forge",
        openJobCount: 0,
        stageBreakdown: [],
      }),
    ])
  })
})
