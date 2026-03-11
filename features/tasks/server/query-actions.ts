"use server"

import { requireCurrentUser } from "@/features/auth/server/auth"
import type { TaskListFilter } from "@/features/tasks/schemas/task-list"
import {
  buildTasksPageData,
  listTasksForUser,
} from "@/features/tasks/server/queries"

export async function getTasksPageDataAction(filter: TaskListFilter) {
  const user = await requireCurrentUser()
  const tasks = await listTasksForUser(user.id)

  return buildTasksPageData(tasks, filter)
}
