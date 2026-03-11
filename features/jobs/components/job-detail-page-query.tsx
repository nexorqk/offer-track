"use client"

import * as React from "react"
import { History, Trash2 } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { JobForm } from "@/features/jobs/components/job-form"
import {
  deleteJobAction,
  updateJobAction,
} from "@/features/jobs/server/actions"
import { getJobDetailPageDataAction } from "@/features/jobs/server/query-actions"
import { jobsQueryKeys } from "@/lib/query-keys"

import { JobDetailWorkflow } from "@/app/(dashboard)/jobs/[id]/_components/job-detail-workflow"

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

  return (
    <div className="grid gap-4">
      {query.isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not refresh this job right now. Showing the latest loaded snapshot.
        </div>
      ) : null}

      <div className="grid gap-5 pb-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.65fr)]">
        <div className="grid gap-5">
          <article className="rounded-[2.25rem] border bg-background/92 p-5 shadow-sm">
            <JobForm
              action={updateJobAction}
              companyOptions={companyOptions}
              description="Adjust stage, comp assumptions, source details, and company assignment without leaving the job record."
              initialValues={job.formValues}
              jobId={job.formValues.id}
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
          <article className="rounded-[2rem] border bg-background/92 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                  Timeline
                </span>
                <h2 className="text-xl font-semibold tracking-tight">
                  Stage history
                </h2>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <History className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {job.history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[1.5rem] border bg-muted/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-medium">
                      {entry.fromStatus
                        ? `${formatStatus(entry.fromStatus)} -> ${formatStatus(entry.toStatus)}`
                        : `Entered as ${formatStatus(entry.toStatus)}`}
                    </strong>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(entry.changedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border bg-[radial-gradient(circle_at_top_right,color-mix(in_oklch,var(--color-destructive)_10%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_22%,transparent))] p-5 shadow-sm">
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Dangerous action
              </span>
              <h2 className="text-xl font-semibold tracking-tight">Delete job</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Removing a job also removes its stage history, linked notes, interviews, and tasks through database cascades.
              </p>
            </div>

            <form action={deleteJobAction} className="mt-5">
              <input type="hidden" name="jobId" value={job.formValues.id} />
              <Button type="submit" size="lg" variant="destructive">
                <Trash2 data-icon="inline-start" />
                Delete job
              </Button>
            </form>
          </article>
        </div>
      </div>
    </div>
  )
}

function formatStatus(value: string) {
  if (value === "hr_screen") {
    return "HR screen"
  }

  return value[0].toUpperCase() + value.slice(1)
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(value)
}
