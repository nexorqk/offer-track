import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}))

import { buildNotesPageData } from "@/features/notes/server/queries"

function createNote(
  overrides: Partial<Parameters<typeof buildNotesPageData>[0][number]> = {},
) {
  return {
    content: "Reach out to alumni, revisit comp bands, prep case-study stories.",
    createdAt: new Date("2026-03-01T09:00:00.000Z"),
    id: "note-1",
    title: "Search plan",
    updatedAt: new Date("2026-03-12T10:00:00.000Z"),
    ...overrides,
  }
}

describe("buildNotesPageData", () => {
  it("sorts notes by freshness and computes summary metrics", () => {
    const now = new Date("2026-03-14T12:00:00.000Z")

    const result = buildNotesPageData(
      [
        createNote(),
        createNote({
          content: "Rewrite the cold intro for staff backend roles.",
          id: "note-2",
          title: "Outreach draft",
          updatedAt: new Date("2026-03-04T08:00:00.000Z"),
        }),
      ],
      now,
    )

    expect(result.summary).toEqual({
      totalNotes: 2,
      totalWords: 18,
      updatedThisWeek: 1,
    })
    expect(result.items.map((item) => item.id)).toEqual(["note-1", "note-2"])
  })

  it("returns empty summary values for a blank workspace", () => {
    expect(buildNotesPageData([])).toEqual({
      items: [],
      summary: {
        totalNotes: 0,
        totalWords: 0,
        updatedThisWeek: 0,
      },
    })
  })
})
