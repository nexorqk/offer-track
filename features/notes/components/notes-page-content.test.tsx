import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

vi.mock("@/features/notes/server/actions", () => ({
  createWorkspaceNoteAction: vi.fn(async () => ({ status: "idle" })),
  deleteWorkspaceNoteAction: vi.fn(async () => ({ status: "idle" })),
  updateWorkspaceNoteAction: vi.fn(async () => ({ status: "idle" })),
}))

vi.mock("@/features/notes/types/actions", () => ({
  initialWorkspaceNoteState: { status: "idle" },
}))

import { NotesPageContent } from "@/features/notes/components/notes-page-content"

describe("NotesPageContent", () => {
  it("renders the empty state and composer fields", () => {
    render(
      <NotesPageContent
        items={[]}
        summary={{
          totalNotes: 0,
          totalWords: 0,
          updatedThisWeek: 0,
        }}
      />,
    )

    expect(screen.getByText("No notes yet. Start with a recruiter outreach draft, interview prep outline, or a running search log.")).toBeInTheDocument()
    expect(screen.getByLabelText("Title")).toBeInTheDocument()
    expect(screen.getByLabelText("Note text")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save note" })).toBeInTheDocument()
  })

  it("renders summary cards and editable note entries", () => {
    render(
      <NotesPageContent
        items={[
          {
            content: "Draft two recruiter intros and a salary expectation paragraph.",
            createdAt: new Date("2026-03-10T08:00:00.000Z"),
            id: "note-1",
            title: "Recruiter outreach",
            updatedAt: new Date("2026-03-12T09:00:00.000Z"),
          },
        ]}
        summary={{
          totalNotes: 1,
          totalWords: 9,
          updatedThisWeek: 1,
        }}
      />,
    )

    expect(screen.getByText("All workspace notes")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Recruiter outreach")).toBeInTheDocument()
    expect(
      screen.getByDisplayValue(
        "Draft two recruiter intros and a salary expectation paragraph.",
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument()
  })
})
