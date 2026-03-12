"use client"

import Link from "next/link"
import * as React from "react"
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { GripVertical, MoveRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import { jobStatusOptions, type JobFormInput } from "@/features/jobs/schemas/job"
import { updateJobStatusAction } from "@/features/jobs/server/actions"
import {
  applyUndoJobStatusMove,
  buildOptimisticJobStatusMove,
  type JobStatusUndoMove,
} from "@/features/jobs/components/jobs-kanban-board-state"
import type { JobListItem } from "@/features/jobs/types/job"
import {
  analyticsQueryKeys,
  companiesQueryKeys,
  jobsQueryKeys,
} from "@/lib/query-keys"
import { cn } from "@/lib/utils"

type JobStatus = NonNullable<JobFormInput["status"]>

export function JobsKanbanBoard({
  jobs: initialJobs,
}: Readonly<{
  jobs: JobListItem[]
}>) {
  const queryClient = useQueryClient()
  const [jobs, setJobs] = React.useState(initialJobs)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [undoMove, setUndoMove] = React.useState<JobStatusUndoMove | null>(null)
  const undoTimeoutRef = React.useRef<number | null>(null)
  const mutationRevisionRef = React.useRef(0)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  React.useEffect(() => {
    setJobs(initialJobs)
  }, [initialJobs])

  React.useEffect(
    () => () => {
      if (undoTimeoutRef.current !== null) {
        window.clearTimeout(undoTimeoutRef.current)
      }
    },
    [],
  )

  const updateStatusMutation = useMutation({
    mutationFn: updateJobStatusAction,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: jobsQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: jobsQueryKeys.detail(variables.jobId),
        }),
        queryClient.invalidateQueries({
          queryKey: analyticsQueryKeys.overview(),
        }),
        queryClient.invalidateQueries({
          queryKey: companiesQueryKeys.list(),
        }),
      ])
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const jobId = String(event.active.id)
    const nextStatus = event.over?.data.current?.status as JobStatus | undefined

    if (!nextStatus) {
      return
    }

    const currentJob = jobs.find((job) => job.id === jobId)

    if (!currentJob || currentJob.status === nextStatus) {
      return
    }

    const move = buildOptimisticJobStatusMove(jobs, jobId, nextStatus, new Date())

    if (!move) {
      return
    }

    const moveRevision = mutationRevisionRef.current + 1
    mutationRevisionRef.current = moveRevision

    if (undoTimeoutRef.current !== null) {
      window.clearTimeout(undoTimeoutRef.current)
    }

    const previousJobs = jobs

    setErrorMessage(null)
    setJobs(move.updatedJobs)
    setUndoMove(move.undoMove)
    undoTimeoutRef.current = window.setTimeout(() => {
      setUndoMove((currentUndoMove) =>
        currentUndoMove?.jobId === move.undoMove.jobId ? null : currentUndoMove,
      )
      undoTimeoutRef.current = null
    }, 5000)

    updateStatusMutation.mutate(
      {
        jobId,
        status: nextStatus,
      },
      {
        onError: () => {
          if (mutationRevisionRef.current !== moveRevision) {
            return
          }

          setJobs(previousJobs)
          setUndoMove(null)
          setErrorMessage("Could not update job status. Try again.")
        },
      },
    )
  }

  function handleUndoMove() {
    if (!undoMove) {
      return
    }

    const revertedMove = undoMove
    const moveRevision = mutationRevisionRef.current + 1
    mutationRevisionRef.current = moveRevision

    if (undoTimeoutRef.current !== null) {
      window.clearTimeout(undoTimeoutRef.current)
      undoTimeoutRef.current = null
    }

    setErrorMessage(null)
    setUndoMove(null)
    setJobs((currentJobs) => applyUndoJobStatusMove(currentJobs, revertedMove, new Date()))

    updateStatusMutation.mutate(
      {
        jobId: revertedMove.jobId,
        status: revertedMove.previousStatus,
      },
      {
        onError: () => {
          if (mutationRevisionRef.current !== moveRevision) {
            return
          }

          setJobs((currentJobs) =>
            buildOptimisticJobStatusMove(
              currentJobs,
              revertedMove.jobId,
              revertedMove.nextStatus,
              new Date(),
            )?.updatedJobs ?? currentJobs,
          )
          setErrorMessage("Could not undo the move. Try again.")
        },
      },
    )
  }

  return (
    <div className="grid gap-4">
      {errorMessage ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {undoMove ? (
        <div className="flex flex-col gap-3 rounded-[1.75rem] border border-primary/20 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-primary)_12%,transparent),color-mix(in_oklch,var(--color-background)_92%,transparent))] px-4 py-3 text-sm text-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p>
              Moved <strong>{undoMove.jobTitle}</strong> to {formatStatusLabel(undoMove.nextStatus)}.
            </p>
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Optimistic update applied
            </span>
          </div>
          <button
            type="button"
            className={buttonVariants({ size: "sm", variant: "outline" })}
            onClick={handleUndoMove}
          >
            Undo
          </button>
        </div>
      ) : null}

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <section className="overflow-hidden rounded-[2rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_8%,transparent),transparent_40%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_94%,transparent),color-mix(in_oklch,var(--color-muted)_16%,transparent))] p-4 shadow-sm surface-enter surface-enter-delay-3">
          <div className="mb-4 flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1">
              <span className="eyebrow-label">
                Kanban board
              </span>
              <h3 className="text-xl font-semibold tracking-tight">
                Drag the pipeline, keep the signal visible
              </h3>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Cards move optimistically, columns keep stage counts visible, and undo stays available for quick corrections.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <BoardStat
                label="Tracked"
                value={String(jobs.length)}
                note="roles on the board"
              />
              <BoardStat
                label="Active"
                value={String(
                  jobs.filter((job) => job.status !== "offer" && job.status !== "rejected").length,
                )}
                note="still moving"
              />
              <BoardStat
                label="Late stage"
                value={String(
                  jobs.filter((job) => job.status === "technical" || job.status === "final").length,
                )}
                note="technical or final"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {jobStatusOptions.map((status, index) => (
              <KanbanColumn
                key={status}
                animationDelay={index * 60}
                jobs={jobs.filter((job) => job.status === status)}
                status={status}
              />
            ))}
          </div>
        </section>
      </DndContext>
    </div>
  )
}

function KanbanColumn({
  animationDelay,
  jobs,
  status,
}: Readonly<{
  animationDelay?: number
  jobs: JobListItem[]
  status: JobStatus
}>) {
  const theme = getStatusTheme(status)
  const { isOver, setNodeRef } = useDroppable({
    data: {
      status,
    },
    id: `status:${status}`,
  })

  return (
    <section
      ref={setNodeRef}
      style={{ animationDelay: `${animationDelay ?? 0}ms` }}
      className={cn(
        "flex min-h-52 flex-col rounded-[1.75rem] border p-3 transition-colors surface-enter",
        theme.surface,
        isOver && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="mb-3 rounded-[1.35rem] border bg-background/78 p-3 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className={cn("mt-1.5 size-2.5 rounded-full", theme.dot)} />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {formatStatusLabel(status)}
              </span>
              <strong className="text-sm font-semibold text-foreground">
                {jobs.length === 1 ? "1 role" : `${jobs.length} roles`}
              </strong>
            </div>
          </div>

          <span className={cn("rounded-full px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em]", theme.badge)}>
            Stage
          </span>
        </div>

        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {jobs.length === 0
            ? "Empty stage. Drag a card here to move the role forward."
            : "Drop zone stays active while dragging a role into this stage."}
        </p>
      </div>

      <div className="grid gap-3">
        {jobs.length === 0 ? (
          <div className="rounded-[1.35rem] border border-dashed bg-background/50 px-4 py-8 text-center text-sm text-muted-foreground">
            Drop a card here
          </div>
        ) : (
          jobs.map((job) => <KanbanCard key={job.id} job={job} />)
        )}
      </div>
    </section>
  )
}

function KanbanCard({
  job,
}: Readonly<{
  job: JobListItem
}>) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    data: {
      status: job.status,
    },
    id: job.id,
  })

  return (
    <article
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.7 : 1,
        transform: CSS.Translate.toString(transform),
      }}
      className={cn(
        "rounded-[1.35rem] border bg-background/92 p-3 shadow-sm hover-lift",
        isDragging && "shadow-lg ring-2 ring-primary/20",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {job.companyName}
          </p>
          <h3 className="mt-1 truncate text-sm font-semibold text-foreground">{job.title}</h3>
        </div>
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-xl border bg-background text-muted-foreground shadow-sm"
          aria-label={`Drag ${job.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {job.location ? (
          <span className="rounded-full border bg-muted/20 px-2 py-1">{job.location}</span>
        ) : null}
        {job.workMode ? (
          <span className="rounded-full border bg-muted/20 px-2 py-1">
            {capitalize(job.workMode)}
          </span>
        ) : null}
        {job.salaryMin || job.salaryMax ? (
          <span className="rounded-full border bg-muted/20 px-2 py-1">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
        <div className="flex flex-col gap-2">
          <PriorityPill priority={job.priority} />
          <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            Updated {formatShortRelative(job.updatedAt)}
          </span>
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          Open
          <MoveRight data-icon="inline-end" />
        </Link>
      </div>
    </article>
  )
}

function BoardStat({
  label,
  note,
  value,
}: Readonly<{
  label: string
  note: string
  value: string
}>) {
  return (
    <article className="rounded-[1.35rem] border bg-background/78 px-3 py-2.5 shadow-sm">
      <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-1 flex items-end justify-between gap-3">
        <strong className="text-2xl font-semibold tracking-tight">{value}</strong>
        <span className="text-right text-xs text-muted-foreground">{note}</span>
      </div>
    </article>
  )
}

function PriorityPill({ priority }: { priority: string }) {
  const tone =
    priority === "high"
      ? "border-orange-500/20 text-orange-700 dark:text-orange-300"
      : priority === "low"
        ? "border-foreground/10 text-muted-foreground"
        : "border-cyan-500/20 text-cyan-700 dark:text-cyan-300"

  return (
    <span className={`rounded-full border px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] ${tone}`}>
      {priority}
    </span>
  )
}

function getStatusTheme(status: JobStatus) {
  switch (status) {
    case "wishlist":
      return {
        badge: "bg-orange-500/12 text-orange-700 dark:text-orange-300",
        dot: "bg-orange-500",
        surface:
          "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,oklch(0.72_0.16_65)_14%,transparent))]",
      }
    case "applied":
      return {
        badge: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
        dot: "bg-cyan-500",
        surface:
          "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,oklch(0.75_0.12_230)_14%,transparent))]",
      }
    case "hr_screen":
      return {
        badge: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
        dot: "bg-sky-500",
        surface:
          "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,oklch(0.78_0.11_240)_14%,transparent))]",
      }
    case "technical":
      return {
        badge: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
        dot: "bg-indigo-500",
        surface:
          "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,oklch(0.62_0.2_280)_14%,transparent))]",
      }
    case "final":
      return {
        badge: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
        dot: "bg-emerald-500",
        surface:
          "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,oklch(0.78_0.17_155)_14%,transparent))]",
      }
    case "offer":
      return {
        badge: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
        dot: "bg-rose-500",
        surface:
          "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,oklch(0.7_0.17_15)_14%,transparent))]",
      }
    case "rejected":
      return {
        badge: "bg-secondary text-secondary-foreground",
        dot: "bg-muted-foreground",
        surface:
          "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_28%,transparent))]",
      }
  }
}

function formatStatusLabel(value: string) {
  if (value === "hr_screen") {
    return "HR screen"
  }

  return value[0].toUpperCase() + value.slice(1)
}

function formatSalary(min: number | null, max: number | null) {
  if (min && max) {
    return `$${min.toLocaleString()}-${max.toLocaleString()}`
  }

  if (min) {
    return `From $${min.toLocaleString()}`
  }

  if (max) {
    return `Up to $${max.toLocaleString()}`
  }

  return ""
}

function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1)
}

function formatShortRelative(value: Date) {
  const diffHours = Math.round((value.getTime() - Date.now()) / (1000 * 60 * 60))
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour")
  }

  return formatter.format(Math.round(diffHours / 24), "day")
}
