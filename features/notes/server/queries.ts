import "server-only"

import { desc, eq } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/lib/db"
import { workspaceNotes } from "@/lib/db/schema"

export type WorkspaceNoteListItem = {
  content: string
  createdAt: Date
  id: string
  title: string
  updatedAt: Date
}

export type NotesPageData = {
  items: WorkspaceNoteListItem[]
  summary: {
    totalNotes: number
    totalWords: number
    updatedThisWeek: number
  }
}

export const listWorkspaceNotesForUser = cache(async function listWorkspaceNotesForUser(
  userId: string,
): Promise<WorkspaceNoteListItem[]> {
  const rows = await db
    .select({
      content: workspaceNotes.content,
      createdAt: workspaceNotes.createdAt,
      id: workspaceNotes.id,
      title: workspaceNotes.title,
      updatedAt: workspaceNotes.updatedAt,
    })
    .from(workspaceNotes)
    .where(eq(workspaceNotes.userId, userId))
    .orderBy(desc(workspaceNotes.updatedAt), desc(workspaceNotes.createdAt))

  return rows satisfies WorkspaceNoteListItem[]
})

export function buildNotesPageData(
  rows: WorkspaceNoteListItem[],
  now = new Date(),
): NotesPageData {
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const items = rows.toSorted(
    (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
  )

  return {
    items,
    summary: {
      totalNotes: items.length,
      totalWords: items.reduce((count, note) => count + countWords(note.content), 0),
      updatedThisWeek: items.filter((note) => note.updatedAt.getTime() >= weekAgo.getTime())
        .length,
    },
  }
}

function countWords(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    return 0
  }

  return normalized.split(/\s+/).length
}
