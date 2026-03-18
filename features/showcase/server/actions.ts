"use server"

import { and, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { showcaseSettingsSchema } from "@/features/showcase/schemas/showcase-settings"
import type { ShowcaseSettingsState } from "@/features/showcase/types/showcase"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"

export async function updateShowcaseSettingsAction(
  _previousState: ShowcaseSettingsState,
  formData: FormData,
): Promise<ShowcaseSettingsState> {
  const user = await requireCurrentUser()
  const parsed = showcaseSettingsSchema.safeParse({
    showcaseBio: getString(formData, "showcaseBio"),
    showcaseEnabled: formData.get("showcaseEnabled") === "on",
    showcaseIntro: getString(formData, "showcaseIntro"),
    showcaseSlug: getString(formData, "showcaseSlug"),
    showcaseTitle: getString(formData, "showcaseTitle"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Fix the highlighted fields and try again.",
      status: "error",
    }
  }

  const [currentProfile] = await db
    .select({
      showcaseSlug: profiles.showcaseSlug,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  const nextSlug = parsed.data.showcaseSlug ?? null

  if (nextSlug) {
    const [conflictingProfile] = await db
      .select({
        id: profiles.id,
      })
      .from(profiles)
      .where(
        and(eq(profiles.showcaseSlug, nextSlug), ne(profiles.id, user.id)),
      )
      .limit(1)

    if (conflictingProfile) {
      return {
        fieldErrors: {
          showcaseSlug: ["This slug is already taken."],
        },
        message: "Pick another public slug.",
        status: "error",
      }
    }
  }

  await db
    .update(profiles)
    .set({
      showcaseBio: parsed.data.showcaseBio ?? null,
      showcaseEnabled: parsed.data.showcaseEnabled,
      showcaseIntro: parsed.data.showcaseIntro ?? null,
      showcaseSlug: nextSlug,
      showcaseTitle: parsed.data.showcaseTitle ?? null,
    })
    .where(eq(profiles.id, user.id))

  revalidatePath("/settings")

  if (currentProfile?.showcaseSlug) {
    revalidatePath(`/showcase/${currentProfile.showcaseSlug}`)
  }

  if (nextSlug) {
    revalidatePath(`/showcase/${nextSlug}`)
  }

  return {
    message: parsed.data.showcaseEnabled
      ? "Showcase settings saved."
      : "Showcase saved in private mode.",
    status: "success",
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}
