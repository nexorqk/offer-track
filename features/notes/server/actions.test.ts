import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockDbDelete,
  mockDbInsert,
  mockDbSelect,
  mockDbUpdate,
  mockRequireCurrentUser,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockDbDelete: vi.fn(),
  mockDbInsert: vi.fn(),
  mockDbSelect: vi.fn(),
  mockDbUpdate: vi.fn(),
  mockRequireCurrentUser: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock("@/features/auth/server/auth", () => ({
  requireCurrentUser: mockRequireCurrentUser,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock("@/lib/db", () => ({
  db: {
    delete: mockDbDelete,
    insert: mockDbInsert,
    select: mockDbSelect,
    update: mockDbUpdate,
  },
}))

import {
  createWorkspaceNoteAction,
  deleteWorkspaceNoteAction,
  updateWorkspaceNoteAction,
} from "@/features/notes/server/actions"
import { workspaceNotes } from "@/lib/db/schema"

function createFormData(entries: Record<string, string>) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value)
  }

  return formData
}

function mockOwnedNote(note: { id: string } | null) {
  const limit = vi.fn().mockResolvedValue(note ? [note] : [])
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })

  mockDbSelect.mockReturnValue({ from })

  return {
    from,
    limit,
    where,
  }
}

function mockNoteInsert(returnedNote = { id: "note-1" }) {
  const returning = vi.fn().mockResolvedValue([returnedNote])
  const values = vi.fn().mockReturnValue({ returning })

  mockDbInsert.mockReturnValue({ values })

  return {
    returning,
    values,
  }
}

function mockNoteUpdate(returnedNote = { id: "note-1" }) {
  const returning = vi.fn().mockResolvedValue([returnedNote])
  const where = vi.fn().mockReturnValue({ returning })
  const set = vi.fn().mockReturnValue({ where })

  mockDbUpdate.mockReturnValue({ set })

  return {
    returning,
    set,
    where,
  }
}

function mockNoteDelete() {
  const where = vi.fn().mockResolvedValue(undefined)

  mockDbDelete.mockReturnValue({ where })

  return {
    where,
  }
}

describe("workspace note actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireCurrentUser.mockResolvedValue({
      email: "alex@example.com",
      id: "user-1",
    })
  })

  it("returns validation errors for an invalid create payload", async () => {
    const result = await createWorkspaceNoteAction(
      { status: "idle" },
      createFormData({
        content: "   ",
        title: "   ",
      }),
    )

    expect(result.status).toBe("error")
    expect(result.message).toBe("Fix the highlighted fields and try again.")
    expect(result.fieldErrors?.content).toContain("Note text is required")
    expect(result.fieldErrors?.title).toContain("Title is required")
    expect(mockDbInsert).not.toHaveBeenCalled()
  })

  it("creates a note and revalidates the notes route", async () => {
    const insert = mockNoteInsert()

    const result = await createWorkspaceNoteAction(
      { status: "idle" },
      createFormData({
        content: "  Questions for screening, salary anchors, and outreach drafts.  ",
        title: "  Recruiter playbook  ",
      }),
    )

    expect(mockDbInsert).toHaveBeenCalledWith(workspaceNotes)
    expect(insert.values).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Questions for screening, salary anchors, and outreach drafts.",
        title: "Recruiter playbook",
        userId: "user-1",
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith("/notes")
    expect(result).toEqual({
      message: "Note saved.",
      status: "success",
    })
  })

  it("returns an error when the note no longer exists during update", async () => {
    mockOwnedNote(null)

    const result = await updateWorkspaceNoteAction(
      { status: "idle" },
      createFormData({
        content: "Updated content",
        noteId: "note-404",
        title: "Updated title",
      }),
    )

    expect(result).toEqual({
      message: "This note no longer exists.",
      status: "error",
    })
    expect(mockDbUpdate).not.toHaveBeenCalled()
  })

  it("updates an owned note and revalidates the notes route", async () => {
    mockOwnedNote({ id: "note-1" })
    const update = mockNoteUpdate()

    const result = await updateWorkspaceNoteAction(
      { status: "idle" },
      createFormData({
        content: "  New prep notes for the final round.  ",
        noteId: "note-1",
        title: "  Final interview prep  ",
      }),
    )

    expect(mockDbUpdate).toHaveBeenCalledWith(workspaceNotes)
    expect(update.set).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "New prep notes for the final round.",
        title: "Final interview prep",
        updatedAt: expect.any(Date),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith("/notes")
    expect(result).toEqual({
      message: "Note updated.",
      status: "success",
    })
  })

  it("deletes an owned note and revalidates the notes route", async () => {
    mockOwnedNote({ id: "note-1" })
    const deletion = mockNoteDelete()

    const result = await deleteWorkspaceNoteAction(
      { status: "idle" },
      createFormData({
        noteId: "note-1",
      }),
    )

    expect(mockDbDelete).toHaveBeenCalledWith(workspaceNotes)
    expect(deletion.where).toHaveBeenCalled()
    expect(mockRevalidatePath).toHaveBeenCalledWith("/notes")
    expect(result).toEqual({
      message: "Note deleted.",
      status: "success",
    })
  })
})
