"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  BriefcaseBusiness,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { buttonVariants } from "@/components/ui/button-variants"
import { Input } from "@/components/ui/input"
import { JobsKanbanBoard } from "@/features/jobs/components/jobs-kanban-board"
import { JobsTableView } from "@/features/jobs/components/jobs-table-view"
import {
  hasActiveJobListFilters,
  jobListPriorityOptions,
  jobListSortOptions,
  jobListStatusOptions,
  jobListViewOptions,
  jobListWorkModeOptions,
  type JobListFilters,
} from "@/features/jobs/schemas/job-list"
import { getJobsPageDataAction } from "@/features/jobs/server/query-actions"
import { jobsQueryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

type JobsPageQueryProps = {
  filters: JobListFilters
  initialData: Awaited<ReturnType<typeof getJobsPageDataAction>>
}

const selectClassName =
  "flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const quickFilterStatuses = [
  { label: "All", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Technical", value: "technical" },
  { label: "Final", value: "final" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
] as const

export function JobsPageQuery({
  filters,
  initialData,
}: Readonly<JobsPageQueryProps>) {
  const queryClient = useQueryClient()
  const hasActiveFilters = hasActiveJobListFilters(filters)
  const queryKey = React.useMemo(
    () => jobsQueryKeys.list(filters),
    [
      filters.priority,
      filters.q,
      filters.sort,
      filters.status,
      filters.view,
      filters.workMode,
    ],
  )
  const query = useQuery({
    initialData,
    queryFn: () => getJobsPageDataAction(filters),
    queryKey,
  })

  React.useEffect(() => {
    queryClient.setQueryData(queryKey, initialData)
  }, [initialData, queryClient, queryKey])

  const data = query.data ?? initialData

  if (!data) {
    return (
      <div className="rounded-[2rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
        Loading jobs...
      </div>
    )
  }

  const { jobs, totalJobs } = data
  const activeJobs = totalJobs.filter((job) => job.status !== "offer" && job.status !== "rejected")
  const lateStageJobs = totalJobs.filter((job) =>
    ["technical", "final", "offer"].includes(job.status),
  )
  const filteredAppliedJobs = jobs.filter((job) => job.status === "applied")
  const filteredOfferJobs = jobs.filter((job) => job.status === "offer")

  return (
    <div className="flex flex-col gap-4">
      {query.isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not refresh jobs right now. Showing the latest loaded snapshot.
        </div>
      ) : null}

      <div className="flex flex-col gap-5 pb-8">
        <section>
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
                      Search, filter, and move opportunities without a create form competing for attention.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/jobs/new" className={buttonVariants({ size: "sm" })}>
                      <Plus data-icon="inline-start" />
                      New job
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  icon={BriefcaseBusiness}
                  label="Open pipeline"
                  note={`${lateStageJobs.length} in technical or later across the full pipeline`}
                  value={String(activeJobs.length)}
                />
                <StatCard
                  icon={Search}
                  label="Visible now"
                  note={
                    hasActiveFilters
                      ? `Filtered from ${totalJobs.length} tracked opportunities`
                      : `${filteredAppliedJobs.length} waiting for first response`
                  }
                  value={String(jobs.length)}
                />
                <StatCard
                  icon={ArrowUpDown}
                  label="Offers closed"
                  note={
                    hasActiveFilters
                      ? `${filteredAppliedJobs.length} applied in the current view`
                      : `${totalJobs.filter((job) => job.status === "rejected").length} archived as rejected`
                  }
                  value={String(filteredOfferJobs.length)}
                />
              </div>
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-[2.25rem] border bg-background/92 shadow-sm">
          <div className="border-b px-5 py-4">
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Job list
              </span>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    All tracked opportunities
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {hasActiveFilters
                      ? `Showing ${jobs.length} of ${totalJobs.length} roles for the current filters.`
                      : "Search by company, role, or location and sort the pipeline the way you work."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    <SlidersHorizontal className="size-3.5" />
                    {hasActiveFilters ? "Filtered view" : "Full pipeline"}
                  </div>
                  <div className="inline-flex rounded-full border bg-background p-1">
                    {jobListViewOptions.map((view) => (
                      <Link
                        key={view}
                        href={buildJobsListHref(filters, { view })}
                        className={cn(
                          buttonVariants({
                            size: "sm",
                            variant: filters.view === view ? "secondary" : "ghost",
                          }),
                          "rounded-full",
                        )}
                      >
                        {view === "table" ? "Table" : "Kanban"}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form method="get" className="grid gap-3 border-b p-4 lg:grid-cols-[minmax(0,1.1fr)_12rem_12rem_12rem_12rem_auto]">
            <input type="hidden" name="view" value={filters.view} />
            <div className="grid gap-2">
              <label htmlFor="jobs-search" className="text-sm font-medium">
                Search
              </label>
              <Input
                id="jobs-search"
                name="q"
                defaultValue={filters.q}
                placeholder="Search by role, company, or location"
              />
            </div>

            <FilterSelect
              defaultValue={filters.status}
              label="Status"
              name="status"
              options={jobListStatusOptions.map((value) => ({
                label: value === "all" ? "All statuses" : formatStatusLabel(value),
                value,
              }))}
            />

            <FilterSelect
              defaultValue={filters.priority}
              label="Priority"
              name="priority"
              options={jobListPriorityOptions.map((value) => ({
                label: value === "all" ? "All priorities" : capitalize(value),
                value,
              }))}
            />

            <FilterSelect
              defaultValue={filters.workMode}
              label="Work mode"
              name="workMode"
              options={jobListWorkModeOptions.map((value) => ({
                label: value === "all" ? "All modes" : capitalize(value),
                value,
              }))}
            />

            <FilterSelect
              defaultValue={filters.sort}
              label="Sort by"
              name="sort"
              options={jobListSortOptions.map((value) => ({
                label: formatSortLabel(value),
                value,
              }))}
            />

            <div className="flex items-end gap-2">
              <button className={buttonVariants({ size: "lg" })} type="submit">
                Apply
              </button>
              {hasActiveFilters ? (
                <Link
                  href="/jobs"
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                >
                  <X data-icon="inline-start" />
                  Reset
                </Link>
              ) : null}
            </div>
          </form>

          <div className="flex flex-wrap gap-2 border-b px-4 py-3">
            {quickFilterStatuses.map((chip) => {
              const href = buildJobsListHref(filters, {
                status: chip.value,
              })
              const isActive = filters.status === chip.value
              const count =
                chip.value === "all"
                  ? totalJobs.length
                  : totalJobs.filter((job) => job.status === chip.value).length

              return (
                <Link
                  key={chip.value}
                  href={href}
                  className={cn(
                    buttonVariants({
                      size: "sm",
                      variant: isActive ? "secondary" : "outline",
                    }),
                    "rounded-full",
                  )}
                >
                  {chip.label}
                  <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[0.68rem] leading-none text-muted-foreground">
                    {count}
                  </span>
                </Link>
              )
            })}
          </div>

          {jobs.length === 0 ? (
            <div className="flex flex-col items-start gap-4 px-5 py-10 text-sm text-muted-foreground">
              <p>
                {hasActiveFilters
                  ? "No jobs match the current filters. Adjust the search or reset the list."
                  : "No jobs yet. Create the first role to start building your pipeline."}
              </p>
              {!hasActiveFilters ? (
                <Link href="/jobs/new" className={buttonVariants({ variant: "outline" })}>
                  <Plus data-icon="inline-start" />
                  Create first job
                </Link>
              ) : null}
            </div>
          ) : filters.view === "kanban" ? (
            <div className="p-4">
              <JobsKanbanBoard jobs={jobs} />
            </div>
          ) : (
            <JobsTableView jobs={jobs} />
          )}
        </section>
      </div>
    </div>
  )
}

function FilterSelect({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue: string
  label: string
  name: string
  options: Array<{ label: string; value: string }>
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className={selectClassName}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

function buildJobsListHref(
  currentFilters: JobListFilters,
  nextFilters: Partial<JobListFilters>,
) {
  const params = new URLSearchParams()
  const mergedFilters = {
    ...currentFilters,
    ...nextFilters,
  }

  if (mergedFilters.q) {
    params.set("q", mergedFilters.q)
  }

  if (mergedFilters.status !== "all") {
    params.set("status", mergedFilters.status)
  }

  if (mergedFilters.priority !== "all") {
    params.set("priority", mergedFilters.priority)
  }

  if (mergedFilters.workMode !== "all") {
    params.set("workMode", mergedFilters.workMode)
  }

  if (mergedFilters.sort !== "updated_desc") {
    params.set("sort", mergedFilters.sort)
  }

  if (mergedFilters.view !== "table") {
    params.set("view", mergedFilters.view)
  }

  const queryString = params.toString()
  return queryString ? `/jobs?${queryString}` : "/jobs"
}

function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1)
}

function formatStatusLabel(value: string) {
  return value === "hr_screen" ? "HR screen" : capitalize(value)
}

function formatSortLabel(value: string) {
  switch (value) {
    case "updated_desc":
      return "Recently updated"
    case "updated_asc":
      return "Oldest updates"
    case "salary_desc":
      return "Highest salary"
    case "salary_asc":
      return "Lowest salary"
    case "company_asc":
      return "Company (A-Z)"
    default:
      return value
  }
}
