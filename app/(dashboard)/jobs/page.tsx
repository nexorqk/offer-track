import Link from "next/link"
import { BriefcaseBusiness, CalendarClock, ChevronRight, Plus } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { requireCurrentUser } from "@/features/auth/server/auth"
import { JobForm } from "@/features/jobs/components/job-form"
import { createJobAction } from "@/features/jobs/server/actions"
import {
  listCompanyNameOptions,
  listJobsForUser,
} from "@/features/jobs/server/queries"
import { emptyJobFormValues } from "@/features/jobs/types/job"

export default async function JobsPage() {
  const user = await requireCurrentUser()
  const [jobs, companyOptions] = await Promise.all([
    listJobsForUser(user.id),
    listCompanyNameOptions(user.id),
  ])

  const activeJobs = jobs.filter((job) => job.status !== "offer" && job.status !== "rejected")
  const lateStageJobs = jobs.filter((job) =>
    ["technical", "final", "offer"].includes(job.status),
  )

  return (
    <div className="flex flex-col gap-5 pb-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <article className="overflow-hidden rounded-[2.25rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_40%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_20%,transparent))] p-5 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Jobs workspace
              </span>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    Pipeline built for action, not just storage.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Create roles, track stage movement, and keep every company tied
                    back to one clean workflow.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="#job-create-form"
                    className={buttonVariants({ size: "sm" })}
                  >
                    <Plus data-icon="inline-start" />
                    New job
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                icon={BriefcaseBusiness}
                label="Open pipeline"
                value={String(activeJobs.length)}
                note={`${lateStageJobs.length} in technical or later`}
              />
              <StatCard
                icon={CalendarClock}
                label="Total tracked"
                value={String(jobs.length)}
                note={`${jobs.filter((job) => job.status === "applied").length} waiting for first response`}
              />
              <StatCard
                icon={ChevronRight}
                label="Offers closed"
                value={String(jobs.filter((job) => job.status === "offer").length)}
                note={`${jobs.filter((job) => job.status === "rejected").length} archived as rejected`}
              />
            </div>
          </div>
        </article>

        <article
          id="job-create-form"
          className="rounded-[2.25rem] border bg-background/92 p-5 shadow-sm"
        >
          <JobForm
            action={createJobAction}
            companyOptions={companyOptions}
            description="Capture a new opportunity and automatically attach it to an existing or freshly created company."
            initialValues={emptyJobFormValues}
            submitLabel="Create job"
            title="Add a role"
          />
        </article>
      </section>

      <section className="overflow-hidden rounded-[2.25rem] border bg-background/92 shadow-sm">
        <div className="flex flex-col gap-2 border-b px-5 py-4">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Job list
          </span>
          <h2 className="text-2xl font-semibold tracking-tight">
            All tracked opportunities
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="px-5 py-10 text-sm text-muted-foreground">
            No jobs yet. Add the first role from the panel above.
          </div>
        ) : (
          <div className="grid gap-3 p-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="grid gap-4 rounded-[1.75rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_22%,transparent))] p-4 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,1.2fr)_auto]"
              >
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-base font-medium">{job.title}</strong>
                    <StatusBadge status={job.status} />
                    <PriorityBadge priority={job.priority} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{job.companyName}</span>
                    {job.location ? <span>{job.location}</span> : null}
                    {job.workMode ? <span>{capitalize(job.workMode)}</span> : null}
                    {job.appliedAt ? <span>Applied {formatDate(job.appliedAt)}</span> : null}
                    {job.salaryMin || job.salaryMax ? (
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground md:flex-col md:items-end md:justify-center">
                  <span>Updated {formatShortRelative(job.updatedAt)}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    Open
                    <ChevronRight className="size-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  note: string
  value: string
}) {
  return (
    <div className="rounded-[1.5rem] border bg-background/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </span>
          <strong className="text-3xl font-semibold tracking-tight">{value}</strong>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{note}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "offer"
      ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
      : status === "rejected"
        ? "bg-rose-500/12 text-rose-700 dark:text-rose-300"
        : status === "technical" || status === "final"
          ? "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300"
          : "bg-secondary text-secondary-foreground"

  return (
    <span className={`rounded-full px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] ${tone}`}>
      {status === "hr_screen" ? "HR screen" : status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "high"
      ? "border-orange-500/20 text-orange-700 dark:text-orange-300"
      : priority === "low"
        ? "border-foreground/10 text-muted-foreground"
        : "border-cyan-500/20 text-cyan-700 dark:text-cyan-300"

  return (
    <span className={`rounded-full border px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] ${tone}`}>
      {priority}
    </span>
  )
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(value)
}

function formatSalary(min: number | null, max: number | null) {
  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  if (min) {
    return `From $${min.toLocaleString()}`
  }

  if (max) {
    return `Up to $${max.toLocaleString()}`
  }

  return ""
}

function formatShortRelative(value: Date) {
  const diffHours = Math.round((value.getTime() - Date.now()) / (1000 * 60 * 60))
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour")
  }

  return formatter.format(Math.round(diffHours / 24), "day")
}

function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1)
}
