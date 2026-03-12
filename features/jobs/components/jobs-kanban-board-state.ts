import type { JobFormInput } from "@/features/jobs/schemas/job"
import type { JobListItem } from "@/features/jobs/types/job"

type JobStatus = NonNullable<JobFormInput["status"]>

export type JobStatusUndoMove = {
  jobId: string
  jobTitle: string
  nextStatus: JobStatus
  previousStatus: JobStatus
}

export function buildOptimisticJobStatusMove(
  jobs: JobListItem[],
  jobId: string,
  nextStatus: JobStatus,
  changedAt = new Date(),
) {
  const currentJob = jobs.find((job) => job.id === jobId)

  if (!currentJob || currentJob.status === nextStatus) {
    return null
  }

  return {
    undoMove: {
      jobId,
      jobTitle: currentJob.title,
      nextStatus,
      previousStatus: currentJob.status,
    } satisfies JobStatusUndoMove,
    updatedJobs: jobs.map((job) =>
      job.id === jobId
        ? {
            ...job,
            status: nextStatus,
            updatedAt: changedAt,
          }
        : job,
    ),
  }
}

export function applyUndoJobStatusMove(
  jobs: JobListItem[],
  undoMove: JobStatusUndoMove,
  changedAt = new Date(),
) {
  return jobs.map((job) =>
    job.id === undoMove.jobId
      ? {
          ...job,
          status: undoMove.previousStatus,
          updatedAt: changedAt,
        }
      : job,
  )
}
