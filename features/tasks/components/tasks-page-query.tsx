"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { TasksPageContent } from "@/features/tasks/components/tasks-page-content"
import { type TaskListFilter } from "@/features/tasks/schemas/task-list"
import { getTasksPageDataAction } from "@/features/tasks/server/query-actions"
import { tasksQueryKeys } from "@/lib/query-keys"

type TasksPageQueryProps = {
  filter: TaskListFilter
  initialData: Awaited<ReturnType<typeof getTasksPageDataAction>>
}

export function TasksPageQuery({
  filter,
  initialData,
}: Readonly<TasksPageQueryProps>) {
  const queryClient = useQueryClient()
  const queryKey = React.useMemo(() => tasksQueryKeys.list(filter), [filter])
  const query = useQuery({
    initialData,
    queryFn: () => getTasksPageDataAction(filter),
    queryKey,
  })

  React.useEffect(() => {
    queryClient.setQueryData(queryKey, initialData)
  }, [initialData, queryClient, queryKey])

  const data = query.data ?? initialData

  if (!data) {
    return (
      <div className="rounded-[2rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
        Loading tasks...
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {query.isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not refresh tasks right now. Showing the latest loaded snapshot.
        </div>
      ) : null}
      <TasksPageContent filter={filter} {...data} />
    </div>
  )
}
