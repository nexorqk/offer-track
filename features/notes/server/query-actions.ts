"use server"

import { requireCurrentUser } from "@/features/auth/server/auth"
import {
  buildNotesPageData,
  listWorkspaceNotesForUser,
} from "@/features/notes/server/queries"

export async function getNotesPageDataAction() {
  const user = await requireCurrentUser()
  const notes = await listWorkspaceNotesForUser(user.id)

  return buildNotesPageData(notes)
}
