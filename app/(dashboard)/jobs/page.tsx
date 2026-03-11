import { requireCurrentUser } from "@/features/auth/server/auth"
import { JobsPageQuery } from "@/features/jobs/components/jobs-page-query"
import {
  hasActiveJobListFilters,
  parseJobListFilters,
} from "@/features/jobs/schemas/job-list"
import { listJobsForUser } from "@/features/jobs/server/queries"

type JobsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const user = await requireCurrentUser()
  const filters = parseJobListFilters(await searchParams)
  const hasActiveFilters = hasActiveJobListFilters(filters)
  const jobsPromise = listJobsForUser(user.id, filters)
  const totalJobsPromise = hasActiveFilters ? listJobsForUser(user.id) : jobsPromise
  const [jobs, totalJobs] = await Promise.all([jobsPromise, totalJobsPromise])

  return <JobsPageQuery filters={filters} initialData={{ jobs, totalJobs }} />
}
