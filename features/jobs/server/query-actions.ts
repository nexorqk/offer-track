"use server"

import {
  hasActiveJobListFilters,
  type JobListFilters,
} from "@/features/jobs/schemas/job-list"
import { requireCurrentUser } from "@/features/auth/server/auth"
import {
  getJobDetailForUser,
  listCompanyNameOptions,
  listJobsForUser,
} from "@/features/jobs/server/queries"

export async function getJobsPageDataAction(filters: JobListFilters) {
  const user = await requireCurrentUser()
  const hasActiveFilters = hasActiveJobListFilters(filters)

  const jobsPromise = listJobsForUser(user.id, filters)
  const totalJobsPromise = hasActiveFilters ? listJobsForUser(user.id) : jobsPromise

  const [jobs, totalJobs] = await Promise.all([jobsPromise, totalJobsPromise])

  return {
    jobs,
    totalJobs,
  }
}

export async function getJobDetailPageDataAction(jobId: string) {
  const user = await requireCurrentUser()
  const [job, companyOptions] = await Promise.all([
    getJobDetailForUser(user.id, jobId),
    listCompanyNameOptions(user.id),
  ])

  if (!job) {
    throw new Error("This job no longer exists.")
  }

  return {
    companyOptions,
    job,
  }
}
