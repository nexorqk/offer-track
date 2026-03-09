import { z } from "zod"

import { jobStatusOptions } from "@/features/jobs/schemas/job"

export const jobListSortOptions = [
  "updated_desc",
  "updated_asc",
  "salary_desc",
  "salary_asc",
  "company_asc",
] as const

export const jobListStatusOptions = ["all", ...jobStatusOptions] as const

export const defaultJobListFilters = {
  q: "",
  sort: "updated_desc",
  status: "all",
} as const

const searchParamValue = z
  .string()
  .transform((value) => value.trim())
  .catch(defaultJobListFilters.q)

export const jobListFiltersSchema = z.object({
  q: searchParamValue,
  sort: z.enum(jobListSortOptions).catch(defaultJobListFilters.sort),
  status: z.enum(jobListStatusOptions).catch(defaultJobListFilters.status),
})

export type JobListFilters = z.infer<typeof jobListFiltersSchema>

export function parseJobListFilters(
  input: Record<string, string | string[] | undefined>,
) {
  return jobListFiltersSchema.parse(input)
}

export function hasActiveJobListFilters(filters: JobListFilters) {
  return (
    filters.q.length > 0 ||
    filters.sort !== defaultJobListFilters.sort ||
    filters.status !== defaultJobListFilters.status
  )
}
