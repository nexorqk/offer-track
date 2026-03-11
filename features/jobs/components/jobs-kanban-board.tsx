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

    const previousJobs = jobs
    const updatedJobs = jobs.map((job) =>
      job.id === jobId
        ? {
            ...job,
            status: nextStatus,
            updatedAt: new Date(),
          }
        : job,
    )

    setErrorMessage(null)
    setJobs(updatedJobs)

    updateStatusMutation.mutate(
      {
        jobId,
        status: nextStatus,
      },
      {
        onError: () => {
          setJobs(previousJobs)
          setErrorMessage("Could not update job status. Try again.")
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

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {jobStatusOptions.map((status) => (
            <KanbanColumn
              key={status}
              jobs={jobs.filter((job) => job.status === status)}
              status={status}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function KanbanColumn({
  jobs,
  status,
}: Readonly<{
  jobs: JobListItem[]
  status: JobStatus
}>) {
  const { isOver, setNodeRef } = useDroppable({
    data: {
      status,
    },
    id: `status:${status}`,
  })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-52 flex-col rounded-[1.75rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_22%,transparent))] p-3 transition-colors",
        isOver && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3 rounded-[1.25rem] border bg-background/80 px-3 py-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {formatStatusLabel(status)}
          </span>
          <strong className="text-sm font-semibold text-foreground">{jobs.length}</strong>
        </div>
        <span className="rounded-full bg-secondary px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-secondary-foreground">
          Drop zone
        </span>
      </div>

      <div className="grid gap-3">
        {jobs.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
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
      className="rounded-[1.25rem] border bg-background/90 p-3 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{job.title}</h3>
          <p className="truncate text-sm text-muted-foreground">{job.companyName}</p>
        </div>
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-xl border bg-background text-muted-foreground"
          aria-label={`Drag ${job.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {job.location ? <span>{job.location}</span> : null}
        {job.workMode ? <span>{capitalize(job.workMode)}</span> : null}
        {job.salaryMin || job.salaryMax ? (
          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <PriorityPill priority={job.priority} />
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
