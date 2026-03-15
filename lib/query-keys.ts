import type { JobListFilters } from "@/features/jobs/schemas/job-list"
import type { TaskListFilter } from "@/features/tasks/schemas/task-list"

export const jobsQueryKeys = {
  all: () => ["jobs"] as const,
  detail: (jobId: string) => ["jobs", "detail", jobId] as const,
  details: () => ["jobs", "detail"] as const,
  list: (filters: JobListFilters) =>
    [
      "jobs",
      "list",
      filters.appliedFrom,
      filters.appliedTo,
      filters.q,
      filters.source,
      filters.salaryMin,
      filters.salaryMax,
      filters.status,
      filters.priority,
      filters.workMode,
      filters.sort,
      filters.view,
    ] as const,
  lists: () => ["jobs", "list"] as const,
}

export const companiesQueryKeys = {
  all: () => ["companies"] as const,
  list: () => ["companies", "list"] as const,
}

export const contactsQueryKeys = {
  all: () => ["contacts"] as const,
  list: () => ["contacts", "list"] as const,
}

export const notesQueryKeys = {
  all: () => ["notes"] as const,
  list: () => ["notes", "list"] as const,
}

export const tasksQueryKeys = {
  all: () => ["tasks"] as const,
  list: (filter: TaskListFilter) => ["tasks", "list", filter] as const,
  lists: () => ["tasks", "list"] as const,
}

export const analyticsQueryKeys = {
  all: () => ["analytics"] as const,
  overview: () => ["analytics", "overview"] as const,
}
