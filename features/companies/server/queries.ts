import "server-only"

import { and, asc, eq, desc } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/lib/db"
import { companies, jobs } from "@/lib/db/schema"

const companyStageOrder = [
  "wishlist",
  "applied",
  "hr_screen",
  "technical",
  "final",
  "offer",
  "rejected",
] as const

const companyStageRank = new Map(
  companyStageOrder.map((status, index) => [status, index]),
)

const activeCompanyStatuses = new Set([
  "wishlist",
  "applied",
  "hr_screen",
  "technical",
  "final",
])

type CompanyStageStatus = (typeof companyStageOrder)[number]

type CompanyListRow = {
  companyId: string
  companyIndustry: string | null
  companyLocation: string | null
  companyName: string
  companyUpdatedAt: Date
  companyWebsite: string | null
  jobId: string | null
  jobStatus: CompanyStageStatus | null
  jobUpdatedAt: Date | null
}

export type CompanyStageBreakdownItem = {
  count: number
  label: string
  status: CompanyStageStatus
}

export type CompanyListItem = {
  averageStageLabel: string | null
  id: string
  industry: string | null
  jobCount: number
  location: string | null
  name: string
  openJobCount: number
  stageBreakdown: CompanyStageBreakdownItem[]
  website: string | null
}

export type CompaniesPageData = {
  items: CompanyListItem[]
  summary: {
    activeJobs: number
    companies: number
    totalJobs: number
  }
}

export const listCompaniesForUser = cache(async function listCompaniesForUser(
  userId: string,
): Promise<CompaniesPageData> {
  const rows = await db
    .select({
      companyId: companies.id,
      companyIndustry: companies.industry,
      companyLocation: companies.location,
      companyName: companies.name,
      companyUpdatedAt: companies.updatedAt,
      companyWebsite: companies.website,
      jobId: jobs.id,
      jobStatus: jobs.status,
      jobUpdatedAt: jobs.updatedAt,
    })
    .from(companies)
    .leftJoin(jobs, and(eq(jobs.companyId, companies.id), eq(jobs.userId, userId)))
    .where(eq(companies.userId, userId))
    .orderBy(asc(companies.name), desc(jobs.updatedAt))

  return buildCompaniesPageData(rows satisfies CompanyListRow[])
})

export function buildCompaniesPageData(rows: CompanyListRow[]): CompaniesPageData {
  const grouped = new Map<
    string,
    {
      averageStageStatuses: CompanyStageStatus[]
      id: string
      industry: string | null
      location: string | null
      name: string
      openJobCount: number
      stageCounts: Map<CompanyStageStatus, number>
      website: string | null
    }
  >()

  for (const row of rows) {
    const existing = grouped.get(row.companyId)

    if (!existing) {
      grouped.set(row.companyId, {
        averageStageStatuses: row.jobStatus ? [row.jobStatus] : [],
        id: row.companyId,
        industry: row.companyIndustry,
        location: row.companyLocation,
        name: row.companyName,
        openJobCount: row.jobStatus && activeCompanyStatuses.has(row.jobStatus) ? 1 : 0,
        stageCounts: createStageCountMap(row.jobStatus),
        website: row.companyWebsite,
      })
      continue
    }

    if (row.jobStatus) {
      existing.averageStageStatuses.push(row.jobStatus)
      existing.stageCounts.set(row.jobStatus, (existing.stageCounts.get(row.jobStatus) ?? 0) + 1)

      if (activeCompanyStatuses.has(row.jobStatus)) {
        existing.openJobCount += 1
      }
    }
  }

  const items = Array.from(grouped.values()).map<CompanyListItem>((company) => {
    const stageBreakdown = companyStageOrder.flatMap<CompanyStageBreakdownItem>((status) => {
      const count = company.stageCounts.get(status) ?? 0

      return count === 0
        ? []
        : [
            {
              count,
              label: formatStatusLabel(status),
              status,
            },
          ]
    })

    return {
      averageStageLabel: getAverageStageLabel(company.averageStageStatuses),
      id: company.id,
      industry: company.industry,
      jobCount: company.averageStageStatuses.length,
      location: company.location,
      name: company.name,
      openJobCount: company.openJobCount,
      stageBreakdown,
      website: company.website,
    }
  })

  return {
    items,
    summary: {
      activeJobs: items.reduce((sum, company) => sum + company.openJobCount, 0),
      companies: items.length,
      totalJobs: items.reduce((sum, company) => sum + company.jobCount, 0),
    },
  }
}

function createStageCountMap(initialStatus: CompanyStageStatus | null) {
  const counts = new Map<CompanyStageStatus, number>()

  if (initialStatus) {
    counts.set(initialStatus, 1)
  }

  return counts
}

function getAverageStageLabel(statuses: CompanyStageStatus[]) {
  if (statuses.length === 0) {
    return null
  }

  const averageRank =
    statuses.reduce((sum, status) => sum + (companyStageRank.get(status) ?? 0), 0) /
    statuses.length
  const roundedRank = Math.round(averageRank)
  const averageStatus = companyStageOrder[roundedRank]

  return averageStatus ? formatStatusLabel(averageStatus) : null
}

function formatStatusLabel(status: CompanyStageStatus) {
  switch (status) {
    case "wishlist":
      return "Wishlist"
    case "applied":
      return "Applied"
    case "hr_screen":
      return "HR screen"
    case "technical":
      return "Technical"
    case "final":
      return "Final"
    case "offer":
      return "Offer"
    case "rejected":
      return "Rejected"
  }
}
