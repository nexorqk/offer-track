"use client"

import Link from "next/link"
import * as React from "react"
import { startTransition } from "react"
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Columns3,
  type LucideIcon,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import type { JobListItem } from "@/features/jobs/types/job"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const optionalColumns = [
  {
    id: "company",
    label: "Company",
    render: (job: JobListItem) => job.companyName,
  },
  {
    id: "status",
    label: "Status",
    render: (job: JobListItem) => <StatusBadge status={job.status} />,
  },
  {
    id: "priority",
    label: "Priority",
    render: (job: JobListItem) => <PriorityBadge priority={job.priority} />,
  },
  {
    id: "location",
    label: "Location",
    render: (job: JobListItem) => job.location ?? "—",
  },
  {
    id: "workMode",
    label: "Work mode",
    render: (job: JobListItem) => (job.workMode ? capitalize(job.workMode) : "—"),
  },
  {
    id: "salary",
    label: "Salary",
    render: (job: JobListItem) => formatSalary(job.salaryMin, job.salaryMax) || "—",
  },
  {
    id: "appliedAt",
    label: "Applied",
    render: (job: JobListItem) => (job.appliedAt ? formatDate(job.appliedAt) : "—"),
  },
  {
    id: "updatedAt",
    label: "Updated",
    render: (job: JobListItem) => formatShortRelative(job.updatedAt),
  },
] as const

type OptionalColumnId = (typeof optionalColumns)[number]["id"]

const defaultVisibleColumnIds: OptionalColumnId[] = [
  "company",
  "status",
  "priority",
  "location",
  "salary",
  "updatedAt",
]

export function JobsTableView({
  jobs,
}: Readonly<{
  jobs: JobListItem[]
}>) {
  const [isColumnPanelOpen, setIsColumnPanelOpen] = React.useState(false)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [visibleColumnIds, setVisibleColumnIds] =
    React.useState<OptionalColumnId[]>(defaultVisibleColumnIds)

  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const visibleColumns = optionalColumns.filter((column) =>
    visibleColumnIds.includes(column.id),
  )
  const rangeStart = safePageIndex * PAGE_SIZE
  const paginatedJobs = jobs.slice(rangeStart, rangeStart + PAGE_SIZE)

  React.useEffect(() => {
    startTransition(() => {
      setPageIndex(0)
    })
  }, [jobs])

  React.useEffect(() => {
    if (pageIndex !== safePageIndex) {
      startTransition(() => {
        setPageIndex(safePageIndex)
      })
    }
  }, [pageIndex, safePageIndex])

  function toggleColumn(columnId: OptionalColumnId) {
    startTransition(() => {
      setVisibleColumnIds((current) =>
        current.includes(columnId)
          ? current.filter((value) => value !== columnId)
          : [...current, columnId],
      )
    })
  }

  function goToPreviousPage() {
    startTransition(() => {
      setPageIndex((current) => Math.max(0, current - 1))
    })
  }

  function goToNextPage() {
    startTransition(() => {
      setPageIndex((current) => Math.min(totalPages - 1, current + 1))
    })
  }

  return (
    <div className="grid gap-4 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {rangeStart + 1}-{Math.min(rangeStart + PAGE_SIZE, jobs.length)} of {jobs.length}{" "}
          roles.
        </p>
        <div className="relative flex items-center gap-2 self-start">
          <button
            type="button"
            aria-expanded={isColumnPanelOpen}
            aria-controls="jobs-table-columns"
            className={buttonVariants({ size: "sm", variant: "outline" })}
            onClick={() => setIsColumnPanelOpen((current) => !current)}
          >
            <Columns3 data-icon="inline-start" />
            Columns
          </button>

          {isColumnPanelOpen ? (
            <div
              id="jobs-table-columns"
              className="absolute right-0 top-full z-10 mt-2 grid min-w-52 gap-2 rounded-[1.25rem] border bg-background p-3 shadow-lg"
            >
              {optionalColumns.map((column) => (
                <label
                  key={column.id}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumnIds.includes(column.id)}
                    onChange={() => toggleColumn(column.id)}
                  />
                  {column.label}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[1.75rem] border bg-background/90">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-muted/35 text-left">
              <TableHeaderCell>Role</TableHeaderCell>
              {visibleColumns.map((column) => (
                <TableHeaderCell key={column.id}>{column.label}</TableHeaderCell>
              ))}
              <TableHeaderCell className="text-right">Open</TableHeaderCell>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.map((job) => (
              <tr key={job.id} className="align-top transition-colors hover:bg-muted/20">
                <TableCell className="min-w-56">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {job.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {job.location ?? "Location not set"}
                    </span>
                  </div>
                </TableCell>
                {visibleColumns.map((column) => (
                  <TableCell key={`${job.id}-${column.id}`}>{column.render(job)}</TableCell>
                ))}
                <TableCell className="text-right">
                  <Link
                    href={`/jobs/${job.id}`}
                    className={buttonVariants({ size: "sm", variant: "outline" })}
                  >
                    Open
                    <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          Page {safePageIndex + 1} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous page"
            className={buttonVariants({ size: "sm", variant: "outline" })}
            disabled={safePageIndex === 0}
            onClick={goToPreviousPage}
          >
            <ChevronLeft data-icon="inline-start" />
            Previous
          </button>
          <button
            type="button"
            aria-label="Next page"
            className={buttonVariants({ size: "sm", variant: "outline" })}
            disabled={safePageIndex === totalPages - 1}
            onClick={goToNextPage}
          >
            Next
            <ChevronRight data-icon="inline-end" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TableHeaderCell({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground first:rounded-tl-[1.75rem] last:rounded-tr-[1.75rem]",
        className,
      )}
    >
      {children}
    </th>
  )
}

function TableCell({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  return (
    <td className={cn("border-b px-4 py-4 text-sm text-muted-foreground last:border-b-0", className)}>
      {children}
    </td>
  )
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const tone =
    status === "offer"
      ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
      : status === "rejected"
        ? "bg-rose-500/12 text-rose-700 dark:text-rose-300"
        : status === "technical" || status === "final"
          ? "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300"
          : "bg-secondary text-secondary-foreground"

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] ${tone}`}
    >
      {formatStatusLabel(status)}
    </span>
  )
}

function PriorityBadge({ priority }: Readonly<{ priority: string }>) {
  const tone =
    priority === "high"
      ? "border-orange-500/20 text-orange-700 dark:text-orange-300"
      : priority === "low"
        ? "border-foreground/10 text-muted-foreground"
        : "border-cyan-500/20 text-cyan-700 dark:text-cyan-300"

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] ${tone}`}
    >
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

function formatStatusLabel(value: string) {
  if (value === "hr_screen") {
    return "HR screen"
  }

  return value[0].toUpperCase() + value.slice(1)
}
