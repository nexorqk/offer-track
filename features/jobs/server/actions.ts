"use server"

import type { ZodError } from "zod"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { jobFormSchema } from "@/features/jobs/schemas/job"
import {
  buildJobStageHistoryEntry,
  normalizeCompanyNameKey,
} from "@/features/jobs/server/job-write"
import type { JobFormState } from "@/features/jobs/types/job"
import { db } from "@/lib/db"
import {
  companies,
  jobStageHistory,
  jobs,
} from "@/lib/db/schema"

function getFieldErrors(error: ZodError): JobFormState["fieldErrors"] {
  return error.flatten().fieldErrors
}

function getSalaryRangeError(formData: FormData) {
  const salaryMin = getString(formData, "salaryMin").trim()
  const salaryMax = getString(formData, "salaryMax").trim()

  if (!salaryMin || !salaryMax) {
    return undefined
  }

  const min = Number(salaryMin)
  const max = Number(salaryMax)

  if (!Number.isFinite(min) || !Number.isFinite(max) || max >= min) {
    return undefined
  }

  return ["Maximum salary must be greater than or equal to minimum salary"]
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

async function resolveCompanyId(userId: string, companyName: string) {
  const normalizedName = normalizeCompanyNameKey(companyName)

  const [existingCompany] = await db
    .select({
      id: companies.id,
    })
    .from(companies)
    .where(
      and(
        eq(companies.userId, userId),
        sql`lower(${companies.name}) = ${normalizedName}`,
      ),
    )
    .limit(1)

  if (existingCompany) {
    return existingCompany.id
  }

  const [company] = await db
    .insert(companies)
    .values({
      name: companyName,
      userId,
    })
    .returning({
      id: companies.id,
    })

  return company.id
}

function parseJobForm(formData: FormData) {
  return jobFormSchema.safeParse({
    appliedAt: getString(formData, "appliedAt"),
    companyName: getString(formData, "companyName"),
    currency: getString(formData, "currency"),
    description: getString(formData, "description"),
    employmentType: getString(formData, "employmentType"),
    location: getString(formData, "location"),
    priority: getString(formData, "priority"),
    salaryMax: getString(formData, "salaryMax"),
    salaryMin: getString(formData, "salaryMin"),
    source: getString(formData, "source"),
    sourceUrl: getString(formData, "sourceUrl"),
    status: getString(formData, "status"),
    title: getString(formData, "title"),
    workMode: getString(formData, "workMode"),
  })
}

export async function createJobAction(
  _previousState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const user = await requireCurrentUser()
  const parsed = parseJobForm(formData)

  if (!parsed.success) {
    const salaryRangeError = getSalaryRangeError(formData)

    return {
      fieldErrors: {
        ...getFieldErrors(parsed.error),
        ...(salaryRangeError ? { salaryMax: salaryRangeError } : {}),
      },
      message: "Fix the highlighted fields and try again.",
      status: "error",
    }
  }

  const jobInput = {
    ...parsed.data,
    priority: parsed.data.priority ?? "medium",
    status: parsed.data.status ?? "wishlist",
  }

  const companyId = await resolveCompanyId(user.id, jobInput.companyName)
  const now = new Date()

  const [job] = await db
    .insert(jobs)
    .values({
      appliedAt: jobInput.appliedAt,
      companyId,
      currency: jobInput.currency,
      description: jobInput.description,
      employmentType: jobInput.employmentType,
      location: jobInput.location,
      priority: jobInput.priority,
      salaryMax: jobInput.salaryMax,
      salaryMin: jobInput.salaryMin,
      source: jobInput.source,
      sourceUrl: jobInput.sourceUrl,
      status: jobInput.status,
      title: jobInput.title,
      updatedAt: now,
      userId: user.id,
      workMode: jobInput.workMode,
    })
    .returning({
      id: jobs.id,
    })

  const stageHistoryEntry = buildJobStageHistoryEntry({
    changedAt: now,
    jobId: job.id,
    nextStatus: jobInput.status,
    previousStatus: null,
  })

  if (stageHistoryEntry) {
    await db.insert(jobStageHistory).values(stageHistoryEntry)
  }

  revalidatePath("/dashboard")
  revalidatePath("/jobs")
  redirect(`/jobs/${job.id}`)
}

export async function updateJobAction(
  _previousState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const user = await requireCurrentUser()
  const jobId = getString(formData, "jobId")
  const parsed = parseJobForm(formData)

  if (!jobId) {
    return {
      message: "Job identifier is missing.",
      status: "error",
    }
  }

  if (!parsed.success) {
    const salaryRangeError = getSalaryRangeError(formData)

    return {
      fieldErrors: {
        ...getFieldErrors(parsed.error),
        ...(salaryRangeError ? { salaryMax: salaryRangeError } : {}),
      },
      message: "Fix the highlighted fields and try again.",
      status: "error",
    }
  }

  const jobInput = {
    ...parsed.data,
    priority: parsed.data.priority ?? "medium",
    status: parsed.data.status ?? "wishlist",
  }

  const [existingJob] = await db
    .select({
      id: jobs.id,
      status: jobs.status,
    })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, user.id)))
    .limit(1)

  if (!existingJob) {
    return {
      message: "This job no longer exists.",
      status: "error",
    }
  }

  const companyId = await resolveCompanyId(user.id, jobInput.companyName)
  const now = new Date()

  await db
    .update(jobs)
    .set({
      appliedAt: jobInput.appliedAt,
      companyId,
      currency: jobInput.currency,
      description: jobInput.description,
      employmentType: jobInput.employmentType,
      location: jobInput.location,
      priority: jobInput.priority,
      salaryMax: jobInput.salaryMax,
      salaryMin: jobInput.salaryMin,
      source: jobInput.source,
      sourceUrl: jobInput.sourceUrl,
      status: jobInput.status,
      title: jobInput.title,
      updatedAt: now,
      workMode: jobInput.workMode,
    })
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, user.id)))

  const stageHistoryEntry = buildJobStageHistoryEntry({
    changedAt: now,
    jobId,
    nextStatus: jobInput.status,
    previousStatus: existingJob.status,
  })

  if (stageHistoryEntry) {
    await db.insert(jobStageHistory).values(stageHistoryEntry)
  }

  revalidatePath("/dashboard")
  revalidatePath("/jobs")
  revalidatePath(`/jobs/${jobId}`)
  redirect(`/jobs/${jobId}`)
}

export async function deleteJobAction(formData: FormData) {
  const user = await requireCurrentUser()
  const jobId = getString(formData, "jobId")

  if (!jobId) {
    redirect("/jobs")
  }

  await db.delete(jobs).where(and(eq(jobs.id, jobId), eq(jobs.userId, user.id)))

  revalidatePath("/dashboard")
  revalidatePath("/jobs")
  revalidatePath(`/jobs/${jobId}`)
  redirect("/jobs")
}
