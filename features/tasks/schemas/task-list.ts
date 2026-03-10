import { z } from "zod"

export const taskListStatusOptions = ["open", "completed", "overdue"] as const

const taskListFiltersSchema = z.object({
  status: z.enum(taskListStatusOptions).catch("open"),
})

export type TaskListFilter = z.infer<typeof taskListFiltersSchema>["status"]

export function parseTaskListFilters(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return taskListFiltersSchema.parse({
    status: getSingleValue(searchParams.status),
  })
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
