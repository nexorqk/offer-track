import { requireCurrentUser } from "@/features/auth/server/auth"
import { TasksPageContent } from "@/features/tasks/components/tasks-page-content"
import { parseTaskListFilters } from "@/features/tasks/schemas/task-list"
import {
  buildTasksPageData,
  listTasksForUser,
} from "@/features/tasks/server/queries"

type TasksPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const [user, params] = await Promise.all([requireCurrentUser(), searchParams])
  const filters = parseTaskListFilters(params)
  const tasks = await listTasksForUser(user.id)

  return (
    <TasksPageContent
      filter={filters.status}
      {...buildTasksPageData(tasks, filters.status)}
    />
  )
}
