const ACTIVE_APPLICATION_STATUSES = new Set([
  "wishlist",
  "applied",
  "hr_screen",
  "technical",
  "final",
])

export type DashboardSummaryJobRow = {
  status:
    | "wishlist"
    | "applied"
    | "hr_screen"
    | "technical"
    | "final"
    | "offer"
    | "rejected"
}

export type DashboardSummary = {
  activeApplications: number
  interviews: number
  offers: number
  totalJobs: number
}

export function buildDashboardSummary(
  jobRows: DashboardSummaryJobRow[],
  interviews: number,
): DashboardSummary {
  return {
    activeApplications: jobRows.filter((job) =>
      ACTIVE_APPLICATION_STATUSES.has(job.status),
    ).length,
    interviews,
    offers: jobRows.filter((job) => job.status === "offer").length,
    totalJobs: jobRows.length,
  }
}
