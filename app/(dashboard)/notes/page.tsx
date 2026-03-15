import { requireCurrentUser } from "@/features/auth/server/auth"
import { NotesPageQuery } from "@/features/notes/components/notes-page-query"
import {
  buildNotesPageData,
  listWorkspaceNotesForUser,
} from "@/features/notes/server/queries"

export default async function NotesPage() {
  const user = await requireCurrentUser()
  const notes = await listWorkspaceNotesForUser(user.id)

  return <NotesPageQuery initialData={buildNotesPageData(notes)} />
}
