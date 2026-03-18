import type { PublicShowcaseMetrics } from "@/features/showcase/types/showcase"

export function computePublicShowcaseMetrics(
  jobsList: Array<{ status: string }>,
  reflectionsCount: number,
): PublicShowcaseMetrics {
  return {
    activeApplications: jobsList.filter(
      (job) => job.status !== "wishlist" && job.status !== "rejected",
    ).length,
    offers: jobsList.filter((job) => job.status === "offer").length,
    reflections: reflectionsCount,
    totalPublicJobs: jobsList.length,
  }
}
