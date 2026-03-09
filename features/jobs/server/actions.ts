"use server"

import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z, type ZodError } from "zod"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { contactFormSchema } from "@/features/contacts/schemas/contact"
import { jobNoteFormSchema } from "@/features/jobs/schemas/job-note"
import {
  jobFormSchema,
  jobStatusOptions,
  type JobFormInput,
} from "@/features/jobs/schemas/job"
import {
  buildJobStageHistoryEntry,
  normalizeCompanyNameKey,
} from "@/features/jobs/server/job-write"
import type { JobFormState } from "@/features/jobs/types/job"
import type {
  JobDetailMutationState,
  JobContactFieldName,
  JobNoteFieldName,
  JobTaskFieldName,
} from "@/features/jobs/types/job-detail"
import { taskFormSchema } from "@/features/tasks/schemas/task"
import { db } from "@/lib/db"
import {
  companies,
  contacts,
  jobStageHistory,
  jobs,
  notes,
  tasks,
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

async function getOwnedJob(userId: string, jobId: string) {
  const [job] = await db
    .select({
      companyId: jobs.companyId,
      id: jobs.id,
    })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .limit(1)

  return job ?? null
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

export async function createJobContactAction(
  _previousState: JobDetailMutationState<JobContactFieldName>,
  formData: FormData,
): Promise<JobDetailMutationState<JobContactFieldName>> {
  const user = await requireCurrentUser()
  const jobId = getString(formData, "jobId")

  if (!jobId) {
    return {
      message: "Job identifier is missing.",
      status: "error",
    }
  }

  const parsed = contactFormSchema.safeParse({
    email: getString(formData, "email"),
    linkedinUrl: getString(formData, "linkedinUrl"),
    name: getString(formData, "name"),
    notes: getString(formData, "notes"),
    role: getString(formData, "role"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Fix the highlighted fields and try again.",
      status: "error",
    }
  }

  const job = await getOwnedJob(user.id, jobId)

  if (!job) {
    return {
      message: "This job no longer exists.",
      status: "error",
    }
  }

  await db.insert(contacts).values({
    companyId: job.companyId,
    email: parsed.data.email,
    jobId,
    linkedinUrl: parsed.data.linkedinUrl,
    name: parsed.data.name,
    notes: parsed.data.notes,
    role: parsed.data.role,
    userId: user.id,
  })

  revalidatePath(`/jobs/${jobId}`)
  revalidatePath("/contacts")

  return {
    message: "Recruiter contact added.",
    status: "success",
  }
}

export async function createJobTaskAction(
  _previousState: JobDetailMutationState<JobTaskFieldName>,
  formData: FormData,
): Promise<JobDetailMutationState<JobTaskFieldName>> {
  const user = await requireCurrentUser()
  const jobId = getString(formData, "jobId")

  if (!jobId) {
    return {
      message: "Job identifier is missing.",
      status: "error",
    }
  }

  const parsed = taskFormSchema.safeParse({
    dueDate: getString(formData, "dueDate"),
    title: getString(formData, "title"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Fix the highlighted fields and try again.",
      status: "error",
    }
  }

  const job = await getOwnedJob(user.id, jobId)

  if (!job) {
    return {
      message: "This job no longer exists.",
      status: "error",
    }
  }

  await db.insert(tasks).values({
    dueDate: parsed.data.dueDate,
    jobId,
    title: parsed.data.title,
    userId: user.id,
  })

  revalidatePath("/dashboard")
  revalidatePath(`/jobs/${jobId}`)
  revalidatePath("/tasks")

  return {
    message: "Follow-up task created.",
    status: "success",
  }
}

export async function createJobNoteAction(
  _previousState: JobDetailMutationState<JobNoteFieldName>,
  formData: FormData,
): Promise<JobDetailMutationState<JobNoteFieldName>> {
  const user = await requireCurrentUser()
  const jobId = getString(formData, "jobId")

  if (!jobId) {
    return {
      message: "Job identifier is missing.",
      status: "error",
    }
  }

  const parsed = jobNoteFormSchema.safeParse({
    content: getString(formData, "content"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Write a note before saving.",
      status: "error",
    }
  }

  const job = await getOwnedJob(user.id, jobId)

  if (!job) {
    return {
      message: "This job no longer exists.",
      status: "error",
    }
  }

  await db.insert(notes).values({
    content: parsed.data.content,
    jobId,
    userId: user.id,
  })

  revalidatePath("/dashboard")
  revalidatePath(`/jobs/${jobId}`)

  return {
    message: "Note saved.",
    status: "success",
  }
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

const updateJobStatusSchema = z.object({
  jobId: z.string().trim().min(1),
  status: z.enum(jobStatusOptions),
})

export async function updateJobStatusAction(input: {
  jobId: string
  status: NonNullable<JobFormInput["status"]>
}) {
  const user = await requireCurrentUser()
  const parsed = updateJobStatusSchema.safeParse(input)

  if (!parsed.success) {
    throw new Error("Invalid job status update payload.")
  }

  const [existingJob] = await db
    .select({
      id: jobs.id,
      status: jobs.status,
    })
    .from(jobs)
    .where(and(eq(jobs.id, parsed.data.jobId), eq(jobs.userId, user.id)))
    .limit(1)

  if (!existingJob) {
    throw new Error("This job no longer exists.")
  }

  if (existingJob.status === parsed.data.status) {
    return {
      status: parsed.data.status,
    }
  }

  const now = new Date()

  await db
    .update(jobs)
    .set({
      status: parsed.data.status,
      updatedAt: now,
    })
    .where(and(eq(jobs.id, parsed.data.jobId), eq(jobs.userId, user.id)))

  const stageHistoryEntry = buildJobStageHistoryEntry({
    changedAt: now,
    jobId: parsed.data.jobId,
    nextStatus: parsed.data.status,
    previousStatus: existingJob.status,
  })

  if (stageHistoryEntry) {
    await db.insert(jobStageHistory).values(stageHistoryEntry)
  }

  revalidatePath("/dashboard")
  revalidatePath("/jobs")
  revalidatePath(`/jobs/${parsed.data.jobId}`)

  return {
    status: parsed.data.status,
  }
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
