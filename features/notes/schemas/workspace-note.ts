import { z } from "zod"

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const workspaceNoteFormSchema = z.object({
  content: requiredText("Note text"),
  title: requiredText("Title"),
})

export type WorkspaceNoteFormInput = z.infer<typeof workspaceNoteFormSchema>
