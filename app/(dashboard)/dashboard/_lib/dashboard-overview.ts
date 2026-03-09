import "server-only"

import { and, asc, desc, eq, gte, isNotNull, lt } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/lib/db"
import {
  companies,
  interviews,
  jobStageHistory,
  jobs,
  notes,
  tasks,
} from "@/lib/db/schema"

const STAGES_WITH_RESPONSE = new Set(["hr_screen", "technical", "final", "offer", "rejected"])
const ACTIVE_JOB_STATUSES = new Set(["wishlist", "applied", "hr_screen", "technical", "final"])

export type DashboardActivityItem = {
  companyName: string
  id: string
  jobTitle: string
  kind: "interview" | "note" | "stage"
  summary: string
  timestamp: Date
  title: string
}

export type DashboardUpcomingInterview = {
  companyName: string
  id: string
  jobTitle: string
  location: string | null
  scheduledAt: Date
  type: "final" | "hr" | "technical"
}

export type DashboardOverdueTask = {
  companyName: string
  dueDate: Date
  id: string
  jobTitle: string
  title: string
}

export type DashboardOverview = {
  overdueTasks: DashboardOverdueTask[]
  recentActivity: DashboardActivityItem[]
  summary: {
    activeApplications: number
    interviewCount: number
    lateStageApplications: number
    overdueTasks: number
    responseRate: number
    responseRateBase: number
  }
  upcomingInterviews: DashboardUpcomingInterview[]
}

export const getDashboardOverview = cache(async function getDashboardOverview(
  userId: string,
): Promise<DashboardOverview> {
  const now = new Date()

  const [
    jobRows,
    upcomingInterviewRows,
    overdueTaskRows,
    recentStageRows,
    recentNoteRows,
    recentInterviewRows,
  ] = await Promise.all([
    db
      .select({
        id: jobs.id,
        status: jobs.status,
      })
      .from(jobs)
      .where(eq(jobs.userId, userId)),
    db
      .select({
        companyName: companies.name,
        id: interviews.id,
        jobTitle: jobs.title,
        location: interviews.location,
        scheduledAt: interviews.scheduledAt,
        type: interviews.type,
      })
      .from(interviews)
      .innerJoin(jobs, eq(interviews.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(eq(jobs.userId, userId), gte(interviews.scheduledAt, now)))
      .orderBy(asc(interviews.scheduledAt))
      .limit(4),
    db
      .select({
        companyName: companies.name,
        dueDate: tasks.dueDate,
        id: tasks.id,
        jobTitle: jobs.title,
        title: tasks.title,
      })
      .from(tasks)
      .innerJoin(jobs, eq(tasks.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, false),
          isNotNull(tasks.dueDate),
          lt(tasks.dueDate, now),
        ),
      )
      .orderBy(asc(tasks.dueDate))
      .limit(4),
    db
      .select({
        companyName: companies.name,
        id: jobStageHistory.id,
        jobTitle: jobs.title,
        timestamp: jobStageHistory.changedAt,
        toStatus: jobStageHistory.toStatus,
      })
      .from(jobStageHistory)
      .innerJoin(jobs, eq(jobStageHistory.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobStageHistory.changedAt))
      .limit(6),
    db
      .select({
        companyName: companies.name,
        content: notes.content,
        id: notes.id,
        jobTitle: jobs.title,
        timestamp: notes.updatedAt,
      })
      .from(notes)
      .innerJoin(jobs, eq(notes.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt))
      .limit(4),
    db
      .select({
        companyName: companies.name,
        id: interviews.id,
        jobTitle: jobs.title,
        timestamp: interviews.createdAt,
        type: interviews.type,
      })
      .from(interviews)
      .innerJoin(jobs, eq(interviews.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.userId, userId))
      .orderBy(desc(interviews.createdAt))
      .limit(3),
  ])

  const appliedJobs = jobRows.filter((job) => job.status !== "wishlist")
  const respondedJobs = appliedJobs.filter((job) => STAGES_WITH_RESPONSE.has(job.status))
  const activeApplications = jobRows.filter((job) => ACTIVE_JOB_STATUSES.has(job.status)).length
  const lateStageApplications = jobRows.filter((job) =>
    ["technical", "final", "offer"].includes(job.status),
  ).length
  const responseRate =
    appliedJobs.length === 0
      ? 0
      : Math.round((respondedJobs.length / appliedJobs.length) * 100)

  const recentActivity = [
    ...recentStageRows.map<DashboardActivityItem>((entry) => ({
      companyName: entry.companyName,
      id: entry.id,
      jobTitle: entry.jobTitle,
      kind: "stage",
      summary: `Pipeline moved to ${formatStatus(entry.toStatus)}.`,
      timestamp: entry.timestamp,
      title: `${entry.companyName} advanced to ${formatStatus(entry.toStatus)}`,
    })),
    ...recentNoteRows.map<DashboardActivityItem>((entry) => ({
      companyName: entry.companyName,
      id: entry.id,
      jobTitle: entry.jobTitle,
      kind: "note",
      summary: trimSentence(entry.content, 96),
      timestamp: entry.timestamp,
      title: `New note on ${entry.companyName}`,
    })),
    ...recentInterviewRows.map<DashboardActivityItem>((entry) => ({
      companyName: entry.companyName,
      id: entry.id,
      jobTitle: entry.jobTitle,
      kind: "interview",
      summary: `${formatInterviewType(entry.type)} interview added to the loop.`,
      timestamp: entry.timestamp,
      title: `${formatInterviewType(entry.type)} interview scheduled for ${entry.companyName}`,
    })),
  ]
    .toSorted((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
    .slice(0, 7)

  return {
    overdueTasks: overdueTaskRows.flatMap((task) =>
      task.dueDate
        ? [
            {
              companyName: task.companyName,
              dueDate: task.dueDate,
              id: task.id,
              jobTitle: task.jobTitle,
              title: task.title,
            },
          ]
        : [],
    ),
    recentActivity,
    summary: {
      activeApplications,
      interviewCount: upcomingInterviewRows.length,
      lateStageApplications,
      overdueTasks: overdueTaskRows.length,
      responseRate,
      responseRateBase: appliedJobs.length,
    },
    upcomingInterviews: upcomingInterviewRows.map((interview) => ({
      companyName: interview.companyName,
      id: interview.id,
      jobTitle: interview.jobTitle,
      location: interview.location,
      scheduledAt: interview.scheduledAt,
      type: interview.type,
    })),
  }
})

function formatInterviewType(value: "final" | "hr" | "technical") {
  switch (value) {
    case "hr":
      return "HR"
    case "technical":
      return "Technical"
    case "final":
      return "Final"
  }
}

function formatStatus(value: string) {
  switch (value) {
    case "hr_screen":
      return "HR screen"
    default:
      return value.charAt(0).toUpperCase() + value.slice(1)
  }
}

function trimSentence(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}
