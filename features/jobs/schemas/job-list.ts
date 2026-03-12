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

export const jobListViewOptions = ["table", "kanban"] as const
export const jobListStatusOptions = ["all", ...jobStatusOptions] as const
export const jobListPriorityOptions = ["all", ...jobPriorityOptions] as const
export const jobListWorkModeOptions = ["all", ...workModeOptions] as const

export const defaultJobListFilters = {
  appliedFrom: "",
  appliedTo: "",
  priority: "all",
  q: "",
  salaryMax: "",
  salaryMin: "",
  sort: "updated_desc",
  source: "",
  status: "all",
  view: "table",
  workMode: "all",
} as const

const searchParamValue = z
  .string()
  .transform((value) => value.trim())
  .catch(defaultJobListFilters.q)

const dateParamValue = z
  .string()
  .transform((value) => value.trim())
  .refine(
    (value) =>
      value.length === 0 ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime())),
    "Enter a valid date",
  )
  .catch("")

const nonNegativeIntegerParamValue = z
  .string()
  .transform((value) => value.trim())
  .refine(
    (value) => value.length === 0 || /^[0-9]+$/.test(value),
    "Enter a whole number",
  )
  .catch("")

export const jobListFiltersSchema = z.object({
  appliedFrom: dateParamValue,
  appliedTo: dateParamValue,
  priority: z.enum(jobListPriorityOptions).catch(defaultJobListFilters.priority),
  q: searchParamValue,
  salaryMax: nonNegativeIntegerParamValue,
  salaryMin: nonNegativeIntegerParamValue,
  sort: z.enum(jobListSortOptions).catch(defaultJobListFilters.sort),
  source: searchParamValue,
  status: z.enum(jobListStatusOptions).catch(defaultJobListFilters.status),
  view: z
    .preprocess((value) => {
      const normalized = Array.isArray(value) ? value[0] : value
      return normalized === "list" ? "table" : normalized
    }, z.enum(jobListViewOptions))
    .catch(defaultJobListFilters.view),
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
    filters.appliedFrom.length > 0 ||
    filters.appliedTo.length > 0 ||
    filters.q.length > 0 ||
    filters.salaryMax.length > 0 ||
    filters.salaryMin.length > 0 ||
    filters.source.length > 0 ||
    filters.priority !== defaultJobListFilters.priority ||
    filters.sort !== defaultJobListFilters.sort ||
    filters.status !== defaultJobListFilters.status ||
    filters.view !== defaultJobListFilters.view ||
    filters.workMode !== defaultJobListFilters.workMode
  )
}
