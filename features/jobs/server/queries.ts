import "server-only"

import { and, asc, desc, eq, gte, ilike, lte, or } from "drizzle-orm"

import { defaultJobListFilters, type JobListFilters } from "@/features/jobs/schemas/job-list"
import { db } from "@/lib/db"
import {
  companies,
  contacts,
  interviews,
  jobStageHistory,
  jobs,
  notes,
  tasks,
} from "@/lib/db/schema"
import type {
  JobContactListItem,
  JobInterviewListItem,
  JobNoteListItem,
  JobTaskListItem,
} from "@/features/jobs/types/job-detail"
import { toJobFormValues } from "@/features/jobs/types/job"

export async function listJobsForUser(
  userId: string,
  filters: JobListFilters = defaultJobListFilters,
) {
  const conditions = [eq(jobs.userId, userId)]

  if (filters.status !== "all") {
    conditions.push(eq(jobs.status, filters.status))
  }

  if (filters.priority !== "all") {
    conditions.push(eq(jobs.priority, filters.priority))
  }

  if (filters.workMode !== "all") {
    conditions.push(eq(jobs.workMode, filters.workMode))
  }

  if (filters.source) {
    conditions.push(ilike(jobs.source, `%${filters.source}%`))
  }

  const appliedFrom = parseFilterDateStart(filters.appliedFrom)

  if (appliedFrom) {
    conditions.push(gte(jobs.appliedAt, appliedFrom))
  }

  const appliedTo = parseFilterDateEnd(filters.appliedTo)

  if (appliedTo) {
    conditions.push(lte(jobs.appliedAt, appliedTo))
  }

  const salaryMin = parseSalaryFilterValue(filters.salaryMin)

  if (salaryMin !== null) {
    conditions.push(or(gte(jobs.salaryMin, salaryMin), gte(jobs.salaryMax, salaryMin))!)
  }

  const salaryMax = parseSalaryFilterValue(filters.salaryMax)

  if (salaryMax !== null) {
    conditions.push(or(lte(jobs.salaryMin, salaryMax), lte(jobs.salaryMax, salaryMax))!)
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

function parseFilterDateStart(value: string) {
  if (!value) {
    return null
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function parseFilterDateEnd(value: string) {
  if (!value) {
    return null
  }

  const date = new Date(`${value}T23:59:59.999Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function parseSalaryFilterValue(value: string) {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
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

  const [
    history,
    linkedContacts,
    linkedInterviews,
    linkedTasks,
    linkedNotes,
  ] = await Promise.all([
    db
      .select({
        changedAt: jobStageHistory.changedAt,
        fromStatus: jobStageHistory.fromStatus,
        id: jobStageHistory.id,
        toStatus: jobStageHistory.toStatus,
      })
      .from(jobStageHistory)
      .where(eq(jobStageHistory.jobId, jobId))
      .orderBy(desc(jobStageHistory.changedAt)),
    db
      .select({
        createdAt: contacts.createdAt,
        email: contacts.email,
        id: contacts.id,
        linkedinUrl: contacts.linkedinUrl,
        name: contacts.name,
        notes: contacts.notes,
        role: contacts.role,
      })
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.jobId, jobId)))
      .orderBy(desc(contacts.updatedAt)),
    db
      .select({
        createdAt: interviews.createdAt,
        durationMinutes: interviews.durationMinutes,
        id: interviews.id,
        location: interviews.location,
        notes: interviews.notes,
        result: interviews.result,
        scheduledAt: interviews.scheduledAt,
        type: interviews.type,
        updatedAt: interviews.updatedAt,
      })
      .from(interviews)
      .innerJoin(jobs, eq(interviews.jobId, jobs.id))
      .where(and(eq(jobs.userId, userId), eq(interviews.jobId, jobId)))
      .orderBy(desc(interviews.scheduledAt), desc(interviews.createdAt)),
    db
      .select({
        completed: tasks.completed,
        createdAt: tasks.createdAt,
        dueDate: tasks.dueDate,
        id: tasks.id,
        title: tasks.title,
      })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.jobId, jobId)))
      .orderBy(asc(tasks.completed), asc(tasks.dueDate), desc(tasks.createdAt)),
    db
      .select({
        content: notes.content,
        createdAt: notes.createdAt,
        id: notes.id,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.jobId, jobId)))
      .orderBy(desc(notes.updatedAt)),
  ])

  return {
    contacts: linkedContacts satisfies JobContactListItem[],
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
    interviews: linkedInterviews satisfies JobInterviewListItem[],
    meta: {
      companyId: job.companyId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    },
    notes: linkedNotes satisfies JobNoteListItem[],
    tasks: linkedTasks satisfies JobTaskListItem[],
  }
}
