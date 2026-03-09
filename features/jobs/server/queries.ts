import "server-only"

import { and, asc, desc, eq, ilike, or } from "drizzle-orm"

import { defaultJobListFilters, type JobListFilters } from "@/features/jobs/schemas/job-list"
import { db } from "@/lib/db"
import {
  companies,
  jobStageHistory,
  jobs,
} from "@/lib/db/schema"
import { toJobFormValues } from "@/features/jobs/types/job"

export async function listJobsForUser(
  userId: string,
  filters: JobListFilters = defaultJobListFilters,
) {
  const conditions = [eq(jobs.userId, userId)]

  if (filters.status !== "all") {
    conditions.push(eq(jobs.status, filters.status))
  }

  if (filters.q) {
    const pattern = `%${filters.q}%`

    conditions.push(
      or(
        ilike(jobs.title, pattern),
        ilike(companies.name, pattern),
        ilike(jobs.location, pattern),
      )!,
    )
  }

  const orderBy =
    filters.sort === "updated_asc"
      ? [asc(jobs.updatedAt), asc(companies.name), asc(jobs.title)]
      : filters.sort === "salary_desc"
        ? [desc(jobs.salaryMax), desc(jobs.salaryMin), desc(jobs.updatedAt)]
        : filters.sort === "salary_asc"
          ? [asc(jobs.salaryMin), asc(jobs.salaryMax), desc(jobs.updatedAt)]
          : filters.sort === "company_asc"
            ? [asc(companies.name), asc(jobs.title), desc(jobs.updatedAt)]
            : [desc(jobs.updatedAt), asc(companies.name), asc(jobs.title)]

  return db
    .select({
      appliedAt: jobs.appliedAt,
      companyName: companies.name,
      id: jobs.id,
      location: jobs.location,
      priority: jobs.priority,
      salaryMax: jobs.salaryMax,
      salaryMin: jobs.salaryMin,
      status: jobs.status,
      title: jobs.title,
      updatedAt: jobs.updatedAt,
      workMode: jobs.workMode,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(and(...conditions))
    .orderBy(...orderBy)
}

export async function listCompanyNameOptions(userId: string) {
  const rows = await db
    .select({
      name: companies.name,
    })
    .from(companies)
    .where(eq(companies.userId, userId))
    .orderBy(companies.name)

  return rows.map((row) => row.name)
}

export async function getJobDetailForUser(userId: string, jobId: string) {
  const [job] = await db
    .select({
      appliedAt: jobs.appliedAt,
      companyName: companies.name,
      companyId: companies.id,
      createdAt: jobs.createdAt,
      currency: jobs.currency,
      description: jobs.description,
      employmentType: jobs.employmentType,
      id: jobs.id,
      location: jobs.location,
      priority: jobs.priority,
      salaryMax: jobs.salaryMax,
      salaryMin: jobs.salaryMin,
      source: jobs.source,
      sourceUrl: jobs.sourceUrl,
      status: jobs.status,
      title: jobs.title,
      updatedAt: jobs.updatedAt,
      workMode: jobs.workMode,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(and(eq(jobs.userId, userId), eq(jobs.id, jobId)))
    .limit(1)

  if (!job) {
    return null
  }

  const history = await db
    .select({
      changedAt: jobStageHistory.changedAt,
      fromStatus: jobStageHistory.fromStatus,
      id: jobStageHistory.id,
      toStatus: jobStageHistory.toStatus,
    })
    .from(jobStageHistory)
    .where(eq(jobStageHistory.jobId, jobId))
    .orderBy(desc(jobStageHistory.changedAt))

  return {
    formValues: {
      id: job.id,
      ...toJobFormValues({
        appliedAt: job.appliedAt ?? undefined,
        companyName: job.companyName,
        currency: job.currency ?? undefined,
        description: job.description ?? undefined,
        employmentType: job.employmentType ?? undefined,
        location: job.location ?? undefined,
        priority: job.priority as "high" | "low" | "medium",
        salaryMax: job.salaryMax ?? undefined,
        salaryMin: job.salaryMin ?? undefined,
        source: job.source ?? undefined,
        sourceUrl: job.sourceUrl ?? undefined,
        status: job.status,
        title: job.title,
        workMode: job.workMode ?? undefined,
      }),
    },
    history,
    meta: {
      companyId: job.companyId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    },
  }
}
