import { z } from "zod"

import {
  jobPriorityOptions,
  jobStatusOptions,
  workModeOptions,
} from "@/features/jobs/schemas/job"

export const jobListSortOptions = [
  "updated_desc",
  "updated_asc",
  "salary_desc",
  "salary_asc",
  "company_asc",
] as const

export const jobListViewOptions = ["list", "kanban"] as const
export const jobListStatusOptions = ["all", ...jobStatusOptions] as const
export const jobListPriorityOptions = ["all", ...jobPriorityOptions] as const
export const jobListWorkModeOptions = ["all", ...workModeOptions] as const

export const defaultJobListFilters = {
  priority: "all",
  q: "",
  sort: "updated_desc",
  status: "all",
  view: "list",
  workMode: "all",
} as const

const searchParamValue = z
  .string()
  .transform((value) => value.trim())
  .catch(defaultJobListFilters.q)

export const jobListFiltersSchema = z.object({
  priority: z.enum(jobListPriorityOptions).catch(defaultJobListFilters.priority),
  q: searchParamValue,
  sort: z.enum(jobListSortOptions).catch(defaultJobListFilters.sort),
  status: z.enum(jobListStatusOptions).catch(defaultJobListFilters.status),
  view: z.enum(jobListViewOptions).catch(defaultJobListFilters.view),
  workMode: z.enum(jobListWorkModeOptions).catch(defaultJobListFilters.workMode),
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
    filters.priority !== defaultJobListFilters.priority ||
    filters.sort !== defaultJobListFilters.sort ||
    filters.status !== defaultJobListFilters.status ||
    filters.view !== defaultJobListFilters.view ||
    filters.workMode !== defaultJobListFilters.workMode
  )
}
