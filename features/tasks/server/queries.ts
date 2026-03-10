import "server-only"

import { asc, desc, eq, sql } from "drizzle-orm"
import { cache } from "react"

import type { TaskListFilter } from "@/features/tasks/schemas/task-list"
import { db } from "@/lib/db"
import { companies, jobs, tasks } from "@/lib/db/schema"

export type TaskListItem = {
  companyName: string
  completed: boolean
  createdAt: Date
  dueDate: Date | null
  id: string
  jobId: string
  jobTitle: string
  title: string
  updatedAt: Date
}

export type TaskListViewItem = TaskListItem & {
  isOverdue: boolean
}

export type TasksPageData = {
  items: TaskListViewItem[]
  summary: {
    completed: number
    open: number
    overdue: number
    total: number
  }
}

export const listTasksForUser = cache(async function listTasksForUser(
  userId: string,
): Promise<TaskListItem[]> {
  const rows = await db
    .select({
      companyName: companies.name,
      completed: tasks.completed,
      createdAt: tasks.createdAt,
      dueDate: tasks.dueDate,
      id: tasks.id,
      jobId: jobs.id,
      jobTitle: jobs.title,
      title: tasks.title,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .innerJoin(jobs, eq(tasks.jobId, jobs.id))
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(tasks.userId, userId))
    .orderBy(
      asc(tasks.completed),
      sql<number>`case when ${tasks.dueDate} is null then 1 else 0 end`,
      asc(tasks.dueDate),
      desc(tasks.updatedAt),
    )

  return rows satisfies TaskListItem[]
})

export function buildTasksPageData(
  rows: TaskListItem[],
  filter: TaskListFilter,
  now = new Date(),
): TasksPageData {
  const items = rows.map<TaskListViewItem>((task) => ({
    ...task,
    isOverdue:
      !task.completed && task.dueDate !== null && task.dueDate.getTime() < now.getTime(),
  }))

  const summary = items.reduce(
    (counts, task) => ({
      completed: counts.completed + (task.completed ? 1 : 0),
      open: counts.open + (task.completed ? 0 : 1),
      overdue: counts.overdue + (task.isOverdue ? 1 : 0),
      total: counts.total + 1,
    }),
    {
      completed: 0,
      open: 0,
      overdue: 0,
      total: 0,
    },
  )

  return {
    items: items
      .filter((task) => matchesTaskFilter(task, filter))
      .toSorted((left, right) => compareTasksForFilter(left, right, filter)),
    summary,
  }
}

function matchesTaskFilter(task: TaskListViewItem, filter: TaskListFilter) {
  switch (filter) {
    case "completed":
      return task.completed
    case "overdue":
      return task.isOverdue
    case "open":
      return !task.completed
  }
}

function compareTasksForFilter(
  left: TaskListViewItem,
  right: TaskListViewItem,
  filter: TaskListFilter,
) {
  if (filter === "completed") {
    return right.updatedAt.getTime() - left.updatedAt.getTime()
  }

  if (left.isOverdue !== right.isOverdue) {
    return Number(right.isOverdue) - Number(left.isOverdue)
  }

  const dueDateComparison = compareNullableDates(left.dueDate, right.dueDate)

  if (dueDateComparison !== 0) {
    return dueDateComparison
  }

  return right.updatedAt.getTime() - left.updatedAt.getTime()
}

function compareNullableDates(left: Date | null, right: Date | null) {
  if (left && right) {
    return left.getTime() - right.getTime()
  }

  if (left) {
    return -1
  }

  if (right) {
    return 1
  }

  return 0
}
