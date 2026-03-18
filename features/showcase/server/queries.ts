import "server-only"

import { and, desc, eq, inArray } from "drizzle-orm"

import { publicNoteKindOptions } from "@/features/showcase/lib/visibility"
import type {
  PublicShowcaseJobPageData,
  PublicShowcasePageData,
  PublicShowcaseReflection,
  ShowcaseSettingsValues,
} from "@/features/showcase/types/showcase"
import { db } from "@/lib/db"
import { companies, jobs, notes, profiles } from "@/lib/db/schema"

import { computePublicShowcaseMetrics } from "./query-helpers"
import { getPublicJobView } from "./visibility-policy"

const EMPTY_SHOWCASE_SETTINGS: ShowcaseSettingsValues = {
  showcaseBio: "",
  showcaseEnabled: false,
  showcaseIntro: "",
  showcaseSlug: "",
  showcaseTitle: "",
}

export async function getShowcaseSettingsForUser(userId: string) {
  const [profile] = await db
    .select({
      showcaseBio: profiles.showcaseBio,
      showcaseEnabled: profiles.showcaseEnabled,
      showcaseIntro: profiles.showcaseIntro,
      showcaseSlug: profiles.showcaseSlug,
      showcaseTitle: profiles.showcaseTitle,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  if (!profile) {
    return EMPTY_SHOWCASE_SETTINGS
  }

  return {
    showcaseBio: profile.showcaseBio ?? "",
    showcaseEnabled: profile.showcaseEnabled,
    showcaseIntro: profile.showcaseIntro ?? "",
    showcaseSlug: profile.showcaseSlug ?? "",
    showcaseTitle: profile.showcaseTitle ?? "",
  } satisfies ShowcaseSettingsValues
}

export async function getPublicShowcaseBySlug(
  slug: string,
): Promise<PublicShowcasePageData | null> {
  const [profile] = await db
    .select({
      bio: profiles.showcaseBio,
      id: profiles.id,
      intro: profiles.showcaseIntro,
      slug: profiles.showcaseSlug,
      title: profiles.showcaseTitle,
    })
    .from(profiles)
    .where(
      and(
        eq(profiles.showcaseEnabled, true),
        eq(profiles.showcaseSlug, slug.trim()),
      ),
    )
    .limit(1)

  if (!profile?.slug) {
    return null
  }

  const [jobRows, reflectionRows] = await Promise.all([
    db
      .select({
        appliedAt: jobs.appliedAt,
        companyName: companies.name,
        location: jobs.location,
        publicId: jobs.publicId,
        publicSummary: jobs.publicSummary,
        source: jobs.source,
        status: jobs.status,
        title: jobs.title,
        updatedAt: jobs.updatedAt,
        workMode: jobs.workMode,
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(
        and(
          eq(jobs.userId, profile.id),
          eq(jobs.visibilityProfile, "public_showcase"),
        ),
      )
      .orderBy(desc(jobs.updatedAt)),
    db
      .select({
        companyName: companies.name,
        content: notes.content,
        createdAt: notes.createdAt,
        id: notes.id,
        jobPublicId: jobs.publicId,
        jobTitle: jobs.title,
        noteKind: notes.noteKind,
        updatedAt: notes.updatedAt,
        visibilityProfile: notes.visibilityProfile,
      })
      .from(notes)
      .innerJoin(jobs, eq(notes.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(
        and(
          eq(notes.userId, profile.id),
          eq(notes.visibilityProfile, "public_showcase"),
          inArray(notes.noteKind, publicNoteKindOptions),
          eq(jobs.visibilityProfile, "public_showcase"),
        ),
      )
      .orderBy(desc(notes.updatedAt)),
  ])

  const selectedJobs = jobRows.map((job) => getPublicJobView(job))
  const reflections = reflectionRows.map((note) => ({
    content: note.content,
    createdAt: note.createdAt,
    id: note.id,
    job: {
      companyName: note.companyName,
      publicId: note.jobPublicId,
      title: note.jobTitle,
    },
    noteKind: note.noteKind as PublicShowcaseReflection["noteKind"],
    updatedAt: note.updatedAt,
    visibilityProfile: note.visibilityProfile,
  }))

  return {
    metrics: computePublicShowcaseMetrics(selectedJobs, reflections.length),
    profile: {
      bio: profile.bio,
      intro: profile.intro,
      slug: profile.slug,
      title: profile.title,
    },
    reflections,
    selectedJobs,
  }
}

export async function getPublicShowcaseJob(
  slug: string,
  publicId: string,
): Promise<PublicShowcaseJobPageData | null> {
  const [profile] = await db
    .select({
      bio: profiles.showcaseBio,
      id: profiles.id,
      intro: profiles.showcaseIntro,
      slug: profiles.showcaseSlug,
      title: profiles.showcaseTitle,
    })
    .from(profiles)
    .where(
      and(
        eq(profiles.showcaseEnabled, true),
        eq(profiles.showcaseSlug, slug.trim()),
      ),
    )
    .limit(1)

  if (!profile?.slug) {
    return null
  }

  const [job] = await db
    .select({
      appliedAt: jobs.appliedAt,
      companyName: companies.name,
      location: jobs.location,
      publicId: jobs.publicId,
      publicSummary: jobs.publicSummary,
      source: jobs.source,
      status: jobs.status,
      title: jobs.title,
      updatedAt: jobs.updatedAt,
      workMode: jobs.workMode,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(
      and(
        eq(jobs.userId, profile.id),
        eq(jobs.publicId, publicId),
        eq(jobs.visibilityProfile, "public_showcase"),
      ),
    )
    .limit(1)

  if (!job) {
    return null
  }

  const reflectionRows = await db
    .select({
      companyName: companies.name,
      content: notes.content,
      createdAt: notes.createdAt,
      id: notes.id,
      jobPublicId: jobs.publicId,
      jobTitle: jobs.title,
      noteKind: notes.noteKind,
      updatedAt: notes.updatedAt,
      visibilityProfile: notes.visibilityProfile,
    })
    .from(notes)
    .innerJoin(jobs, eq(notes.jobId, jobs.id))
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(
      and(
        eq(notes.userId, profile.id),
        eq(jobs.publicId, publicId),
        eq(notes.visibilityProfile, "public_showcase"),
        inArray(notes.noteKind, publicNoteKindOptions),
      ),
    )
    .orderBy(desc(notes.updatedAt))

  return {
    job: getPublicJobView(job),
    profile: {
      bio: profile.bio,
      intro: profile.intro,
      slug: profile.slug,
      title: profile.title,
    },
    reflections: reflectionRows.map((note) => ({
      content: note.content,
      createdAt: note.createdAt,
      id: note.id,
      job: {
        companyName: note.companyName,
        publicId: note.jobPublicId,
        title: note.jobTitle,
      },
      noteKind: note.noteKind as PublicShowcaseReflection["noteKind"],
      updatedAt: note.updatedAt,
      visibilityProfile: note.visibilityProfile,
    })),
  }
}
