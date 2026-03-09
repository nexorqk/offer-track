import { z } from "zod"

export const jobNoteFormSchema = z.object({
  content: z.string().trim().min(1, "Note is required"),
})

export type JobNoteFormInput = z.infer<typeof jobNoteFormSchema>
