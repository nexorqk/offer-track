"use client"

import * as React from "react"
import {
  ArrowUpRight,
  Building2,
  Clock3,
  History,
  Link2,
  MapPin,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { JobForm } from "@/features/jobs/components/job-form"
import {
  JobStatusBadge,
} from "@/features/jobs/components/job-status-badge"
import {
  deleteJobAction,
  updateJobAction,
} from "@/features/jobs/server/actions"
import { getJobDetailPageDataAction } from "@/features/jobs/server/query-actions"
import { jobsQueryKeys } from "@/lib/query-keys"

import { JobDetailWorkflow } from "@/app/(dashboard)/jobs/[id]/_components/job-detail-workflow"
import { cn } from "@/lib/utils"

type JobDetailPageQueryProps = {
  initialData: Awaited<ReturnType<typeof getJobDetailPageDataAction>>
  jobId: string
}

export function JobDetailPageQuery({
  initialData,
  jobId,
}: Readonly<JobDetailPageQueryProps>) {
  const queryClient = useQueryClient()
  const queryKey = React.useMemo(() => jobsQueryKeys.detail(jobId), [jobId])
  const query = useQuery({
    initialData,
    queryFn: () => getJobDetailPageDataAction(jobId),
    queryKey,
  })

  React.useEffect(() => {
    queryClient.setQueryData(queryKey, initialData)
  }, [initialData, queryClient, queryKey])

  const data = query.data ?? initialData

  if (!data) {
    return (
      <div className="rounded-[2rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
        Loading job details...
      </div>
    )
  }

  const { companyOptions, job } = data
  const { formValues } = job

  return (
    <div className="grid gap-4">
      {query.isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not refresh this job right now. Showing the latest loaded snapshot.
        </div>
      ) : null}

      <JobHeaderCard job={job} />

      <div className="grid gap-5 pb-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.65fr)]">
        <div className="grid gap-5">
          <article className="rounded-[2.25rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_94%,transparent),color-mix(in_oklch,var(--color-muted)_16%,transparent))] p-5 shadow-sm surface-enter surface-enter-delay-2">
            <JobForm
              action={updateJobAction}
              companyOptions={companyOptions}
              description="Adjust stage, comp assumptions, source details, and company assignment without leaving the job record."
              initialValues={formValues}
              jobId={formValues.id}
              submitLabel="Save changes"
              title="Edit job"
            />
          </article>

          <JobDetailWorkflow
            contacts={job.contacts}
            interviews={job.interviews}
            jobId={job.formValues.id}
            notes={job.notes}
            tasks={job.tasks}
          />
        </div>

        <div className="grid gap-5 self-start">
          <JobTimelineCard history={job.history} />

          <DeleteJobDangerCard jobId={formValues.id} />
        </div>
      </div>
    </div>
  )
}

function JobHeaderCard({
  job,
}: Readonly<{
  job: NonNullable<JobDetailPageQueryProps["initialData"]>["job"]
}>) {
  const { formValues, history, meta } = job

  return (
    <article className="overflow-hidden rounded-[2.35rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_94%,transparent),color-mix(in_oklch,var(--color-muted)_18%,transparent))] p-5 shadow-sm surface-enter surface-enter-delay-1 lg:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow-label">
                Job header
              </span>
              <JobStatusBadge status={formValues.status} />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight">
                {formValues.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
                  <Building2 className="size-4" />
                  {formValues.companyName}
                </span>
                {formValues.location ? (
                  <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
                    <MapPin className="size-4" />
                    {formValues.location}
                  </span>
                ) : null}
                {formValues.workMode ? (
                  <span className="rounded-full border bg-background/70 px-3 py-1.5">
                    {capitalize(formValues.workMode)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[21rem]">
            <MetaPill
              icon={History}
              label="Stage moves"
              value={`${history.length} entries`}
            />
            <MetaPill
              icon={Clock3}
              label="Updated"
              value={formatDateTime(meta.updatedAt)}
            />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {formatCompensation(formValues.salaryMin, formValues.salaryMax, formValues.currency) ? (
              <MetaPill
                icon={Wallet}
                label="Comp"
                value={
                  formatCompensation(
                    formValues.salaryMin,
                    formValues.salaryMax,
                    formValues.currency,
                  ) ?? "Not set"
                }
              />
            ) : null}
            {formValues.source ? (
              <MetaPill
                icon={Sparkles}
                label="Source"
                value={formValues.source}
              />
            ) : null}
            {formValues.appliedAt ? (
              <MetaPill
                icon={Clock3}
                label="Applied"
                value={formatShortDate(new Date(formValues.appliedAt))}
              />
            ) : null}
            <MetaPill
              icon={Clock3}
              label="Created"
              value={formatShortDate(meta.createdAt)}
            />
          </div>

          {formValues.sourceUrl ? (
            <a
              href={formValues.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 self-start rounded-[1rem] border bg-background/80 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Link2 className="size-4" />
              Open source link
              <ArrowUpRight className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function JobTimelineCard({
  history,
}: Readonly<{
  history: Array<{
    changedAt: Date
    fromStatus: string | null
    id: string
    toStatus: string
  }>
}>) {
  return (
    <article className="rounded-[2rem] border bg-background/92 p-5 shadow-sm surface-enter surface-enter-delay-3">
      <div className="flex items-start justify-between gap-3 border-b pb-4">
        <div className="flex flex-col gap-1">
          <span className="eyebrow-label">
            Timeline
          </span>
          <h2 className="text-xl font-semibold tracking-tight">Stage history</h2>
          <p className="text-sm text-muted-foreground">
            Every status transition for this role in reverse chronological order.
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <History className="size-4" />
        </div>
      </div>

      <div className="relative mt-4 flex flex-col gap-3 pl-5 before:absolute before:bottom-4 before:left-4 before:top-3 before:w-px before:bg-border">
        {history.map((entry, index) => (
          <div
            key={entry.id}
            className="relative rounded-[1.5rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_18%,transparent))] p-4"
          >
            <span
              className={cn(
                "absolute -left-[1.68rem] top-5 size-4 rounded-full border-[5px] border-background shadow-sm",
                index === 0 ? "bg-primary" : "bg-secondary-foreground/60",
              )}
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {entry.fromStatus ? (
                  <>
                    <JobStatusBadge status={entry.fromStatus} />
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      to
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    Entered as
                  </span>
                )}
                <JobStatusBadge status={entry.toStatus} />
              </div>
              <span className="rounded-full border bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
                {formatDateTime(entry.changedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function DeleteJobDangerCard({
  jobId,
}: Readonly<{
  jobId: string
}>) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  function handleCancel() {
    if (isDeleting) {
      return
    }

    setIsConfirmOpen(false)
  }

  function handleConfirm() {
    setIsDeleting(true)
    formRef.current?.requestSubmit()
  }

  return (
    <>
      <article className="rounded-[2rem] border bg-[radial-gradient(circle_at_top_right,color-mix(in_oklch,var(--color-destructive)_10%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_22%,transparent))] p-5 shadow-sm surface-enter surface-enter-delay-4">
        <div className="flex flex-col gap-2">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Dangerous action
          </span>
          <h2 className="text-xl font-semibold tracking-tight">Delete job</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Removing a job also removes its stage history, linked notes, interviews, and tasks through database cascades.
          </p>
        </div>

        <form ref={formRef} action={deleteJobAction} className="mt-5">
          <input type="hidden" name="jobId" value={jobId} />
          <Button
            type="button"
            size="lg"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => setIsConfirmOpen(true)}
          >
            <Trash2 data-icon="inline-start" />
            Delete job
          </Button>
        </form>
      </article>

      <ConfirmDialog
        confirmLabel="Delete job"
        description="This permanently removes the job, stage history, notes, interviews, and follow-up tasks."
        isPending={isDeleting}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        open={isConfirmOpen}
        title="Delete this job?"
        tone="destructive"
      />
    </>
  )
}

function MetaPill({
  icon: Icon,
  label,
  value,
}: Readonly<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}>) {
  return (
    <div className="rounded-[1.35rem] border bg-background/78 px-3 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </span>
          <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
        <div className="flex size-9 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  )
}

function formatCompensation(
  min?: number | string | null,
  max?: number | string | null,
  currency?: string | null,
) {
  const normalizedMin = normalizeCompensationValue(min)
  const normalizedMax = normalizeCompensationValue(max)
  const prefix = currency ? `${currency} ` : "$"

  if (normalizedMin !== null && normalizedMax !== null) {
    return `${prefix}${normalizedMin.toLocaleString()} - ${prefix}${normalizedMax.toLocaleString()}`
  }

  if (normalizedMin !== null) {
    return `From ${prefix}${normalizedMin.toLocaleString()}`
  }

  if (normalizedMax !== null) {
    return `Up to ${prefix}${normalizedMax.toLocaleString()}`
  }

  return null
}

function normalizeCompensationValue(value?: number | string | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "string") {
    const normalized = value.trim()

    if (!normalized) {
      return null
    }

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1)
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value)
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(value)
}
