import type { JobFormInput } from "@/features/jobs/schemas/job"

export function normalizeCompanyNameKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export function buildJobStageHistoryEntry({
  changedAt,
  jobId,
  nextStatus,
  previousStatus,
}: {
  changedAt: Date
  jobId: string
  nextStatus: NonNullable<JobFormInput["status"]>
  previousStatus: NonNullable<JobFormInput["status"]> | null
}) {
  if (previousStatus === nextStatus) {
    return null
  }

  return {
    changedAt,
    fromStatus: previousStatus,
    jobId,
    toStatus: nextStatus,
  }
}
