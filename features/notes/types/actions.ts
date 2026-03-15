export type WorkspaceNoteFieldName = "content" | "title"

export type WorkspaceNoteActionState = {
  fieldErrors?: Partial<Record<WorkspaceNoteFieldName, string[]>>
  message?: string
  status: "error" | "idle" | "success"
}

export const initialWorkspaceNoteState: WorkspaceNoteActionState = {
  status: "idle",
}
