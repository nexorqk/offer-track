import { notFound } from "next/navigation"
import { History, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { requireCurrentUser } from "@/features/auth/server/auth"
import { JobForm } from "@/features/jobs/components/job-form"
import {
  deleteJobAction,
  updateJobAction,
} from "@/features/jobs/server/actions"
import {
  getJobDetailForUser,
  listCompanyNameOptions,
} from "@/features/jobs/server/queries"

import { JobDetailWorkflow } from "./_components/job-detail-workflow"

type JobDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params
  const user = await requireCurrentUser()
  const [job, companyOptions] = await Promise.all([
    getJobDetailForUser(user.id, id),
    listCompanyNameOptions(user.id),
  ])

  if (!job) {
    notFound()
  }

  return (
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
              Removing a job also removes its stage history, linked notes,
              interviews, and tasks through database cascades.
            </p>
          </div>

          <form action={deleteJobAction} className="mt-5">
            <input type="hidden" name="jobId" value={job.formValues.id} />
            <Button type="submit" variant="destructive" size="lg">
              <Trash2 data-icon="inline-start" />
              Delete job
            </Button>
          </form>
        </article>
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
