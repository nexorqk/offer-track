"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { workspaceNoteFormSchema } from "@/features/notes/schemas/workspace-note"
import type { WorkspaceNoteActionState } from "@/features/notes/types/actions"
import { db } from "@/lib/db"
import { workspaceNotes } from "@/lib/db/schema"

export async function createWorkspaceNoteAction(
  _previousState: WorkspaceNoteActionState,
  formData: FormData,
): Promise<WorkspaceNoteActionState> {
  const user = await requireCurrentUser()
  const parsed = workspaceNoteFormSchema.safeParse({
    content: getString(formData, "content"),
    title: getString(formData, "title"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Fix the highlighted fields and try again.",
      status: "error",
    }
  }

  await db
    .insert(workspaceNotes)
    .values({
      content: parsed.data.content,
      title: parsed.data.title,
      updatedAt: new Date(),
      userId: user.id,
    })
    .returning({
      id: workspaceNotes.id,
    })

  revalidatePath("/notes")

  return {
    message: "Note saved.",
    status: "success",
  }
}

export async function updateWorkspaceNoteAction(
  _previousState: WorkspaceNoteActionState,
  formData: FormData,
): Promise<WorkspaceNoteActionState> {
  const user = await requireCurrentUser()
  const noteId = getString(formData, "noteId")

  if (!noteId) {
    return {
      message: "Note identifier is missing.",
      status: "error",
    }
  }

  const parsed = workspaceNoteFormSchema.safeParse({
    content: getString(formData, "content"),
    title: getString(formData, "title"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Fix the highlighted fields and try again.",
      status: "error",
    }
  }

  const note = await getOwnedNote(user.id, noteId)

  if (!note) {
    return {
      message: "This note no longer exists.",
      status: "error",
    }
  }

  await db
    .update(workspaceNotes)
    .set({
      content: parsed.data.content,
      title: parsed.data.title,
      updatedAt: new Date(),
    })
    .where(and(eq(workspaceNotes.id, noteId), eq(workspaceNotes.userId, user.id)))
    .returning({
      id: workspaceNotes.id,
    })

  revalidatePath("/notes")

  return {
    message: "Note updated.",
    status: "success",
  }
}

export async function deleteWorkspaceNoteAction(
  _previousState: WorkspaceNoteActionState,
  formData: FormData,
): Promise<WorkspaceNoteActionState> {
  const user = await requireCurrentUser()
  const noteId = getString(formData, "noteId")

  if (!noteId) {
    return {
      message: "Note identifier is missing.",
      status: "error",
    }
  }

  const note = await getOwnedNote(user.id, noteId)

  if (!note) {
    return {
      message: "This note no longer exists.",
      status: "error",
    }
  }

  await db
    .delete(workspaceNotes)
    .where(and(eq(workspaceNotes.id, noteId), eq(workspaceNotes.userId, user.id)))

  revalidatePath("/notes")

  return {
    message: "Note deleted.",
    status: "success",
  }
}

async function getOwnedNote(userId: string, noteId: string) {
  const [note] = await db
    .select({
      id: workspaceNotes.id,
    })
    .from(workspaceNotes)
    .where(and(eq(workspaceNotes.id, noteId), eq(workspaceNotes.userId, userId)))
    .limit(1)

  return note ?? null
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}
