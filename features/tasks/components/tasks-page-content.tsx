import Link from "next/link"
import {
  AlarmClockOff,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  type LucideIcon,
  ListTodo,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import {
  taskListStatusOptions,
  type TaskListFilter,
} from "@/features/tasks/schemas/task-list"
import type { TasksPageData } from "@/features/tasks/server/queries"
import { cn } from "@/lib/utils"

import { TaskCompletionForm } from "./task-completion-form"

type TasksPageContentProps = {
  filter: TaskListFilter
} & TasksPageData

const filterLabels: Record<TaskListFilter, string> = {
  completed: "Completed",
  open: "Open",
  overdue: "Overdue",
}

export function TasksPageContent({
  filter,
  items,
  summary,
}: Readonly<TasksPageContentProps>) {
  const filterCounts: Record<TaskListFilter, number> = {
    completed: summary.completed,
    open: summary.open,
    overdue: summary.overdue,
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <section>
        <article className="overflow-hidden rounded-[2.25rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_20%,transparent))] p-5 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Follow-up queue
              </span>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    Keep every thread moving before momentum drops.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Review overdue follow-ups, close out completed reminders, and jump straight
                    back into the linked job when it is time to act.
                  </p>
                </div>
                <Link
                  href="/jobs?view=kanban"
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <BriefcaseBusiness data-icon="inline-start" />
                  Back to jobs
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCard
                icon={ListTodo}
                label="Open now"
                note="Everything still in motion"
                value={String(summary.open)}
              />
              <SummaryCard
                icon={Clock3}
                label="Overdue"
                note="Needs attention first"
                value={String(summary.overdue)}
              />
              <SummaryCard
                icon={CheckCircle2}
                label="Completed"
                note="Closed loops and done"
                value={String(summary.completed)}
              />
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[2.25rem] border bg-background/92 shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Task list
            </span>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {filterLabels[filter]} follow-ups
                </h2>
                <p className="text-sm text-muted-foreground">
                  {summary.total === 0
                    ? "No tasks created yet. Add follow-ups from a job detail page."
                    : `${items.length} of ${summary.total} tasks in the current view.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {taskListStatusOptions.map((status) => (
                  <Link
                    key={status}
                    href={buildTasksHref(status)}
                    className={cn(
                      buttonVariants({
                        size: "sm",
                        variant: filter === status ? "secondary" : "outline",
                      }),
                      "rounded-full",
                    )}
                  >
                    {filterLabels[status]}
                    <span className="rounded-full bg-background/75 px-2 py-0.5 text-[0.68rem] text-muted-foreground">
                      {filterCounts[status]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4">
          {items.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            items.map((task) => (
              <article
                key={task.id}
                className="rounded-[1.75rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_96%,transparent),color-mix(in_oklch,var(--color-muted)_16%,transparent))] p-5 shadow-[0_1px_0_color-mix(in_oklch,var(--color-foreground)_5%,transparent)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={statusPillClassName(task.completed, task.isOverdue)}>
                        {task.completed ? "Done" : task.isOverdue ? "Overdue" : "Open"}
                      </span>
                      <span className="rounded-full bg-muted/70 px-3 py-1 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                        {task.dueDate ? `Due ${formatDueDate(task.dueDate)}` : "No due date"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {task.companyName} · {task.jobTitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="inline-flex items-center gap-2">
                        <BriefcaseBusiness className="size-4" />
                        <Link
                          href={`/jobs/${task.jobId}`}
                          className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {task.jobTitle}
                        </Link>
                      </div>
                      {task.isOverdue ? (
                        <div className="inline-flex items-center gap-2 text-rose-700 dark:text-rose-300">
                          <AlarmClockOff className="size-4" />
                          <span>{formatOverdueLabel(task.dueDate)}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <Link
                      href={`/jobs/${task.jobId}`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      <ArrowUpRight data-icon="inline-start" />
                      View job
                    </Link>
                    <TaskCompletionForm completed={task.completed} taskId={task.id} />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  note,
  value,
}: Readonly<{
  icon: LucideIcon
  label: string
  note: string
  value: string
}>) {
  return (
    <article className="rounded-[1.5rem] border bg-background/80 p-4 shadow-[0_1px_0_color-mix(in_oklch,var(--color-foreground)_5%,transparent)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{note}</p>
    </article>
  )
}

function EmptyState({ filter }: Readonly<{ filter: TaskListFilter }>) {
  return (
    <div className="rounded-[1.75rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
      {filter === "overdue"
        ? "Nothing overdue. Current follow-ups are on track."
        : filter === "completed"
          ? "No completed tasks yet. Mark finished reminders here as the pipeline moves."
          : "No open tasks right now. Add a follow-up from a job detail page when the next step is clear."}
    </div>
  )
}

function buildTasksHref(status: TaskListFilter) {
  return status === "open" ? "/tasks" : `/tasks?status=${status}`
}

function formatDueDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(value)
}

function formatOverdueLabel(value: Date | null) {
  if (!value) {
    return "Past due"
  }

  const diffDays = Math.max(
    1,
    Math.ceil((Date.now() - value.getTime()) / (1000 * 60 * 60 * 24)),
  )

  return `${diffDays}d late`
}

function statusPillClassName(completed: boolean, isOverdue: boolean) {
  if (completed) {
    return "rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-medium tracking-[0.12em] text-emerald-700 uppercase dark:text-emerald-300"
  }

  if (isOverdue) {
    return "rounded-full bg-rose-500/12 px-3 py-1 text-xs font-medium tracking-[0.12em] text-rose-700 uppercase dark:text-rose-300"
  }

  return "rounded-full bg-sky-500/12 px-3 py-1 text-xs font-medium tracking-[0.12em] text-sky-700 uppercase dark:text-sky-300"
}
