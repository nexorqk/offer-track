import { z } from "zod"

import { getNoteVisibilityValidationMessage } from "@/features/showcase/lib/policy"
import {
  noteKindOptions,
  visibilityProfileOptions,
} from "@/features/showcase/lib/visibility"

export const jobNoteFormSchema = z
  .object({
    content: z.string().trim().min(1, "Note is required"),
    noteKind: z.enum(noteKindOptions).catch("internal"),
    visibilityProfile: z.enum(visibilityProfileOptions).catch("private"),
  })
  .superRefine((value, context) => {
    const validationMessage = getNoteVisibilityValidationMessage({
      noteKind: value.noteKind,
      visibilityProfile: value.visibilityProfile,
    })

    if (!validationMessage) {
      return
    }

    context.addIssue({
      code: "custom",
      message: validationMessage,
      path: ["visibilityProfile"],
    })
  })

export type JobNoteFormInput = z.infer<typeof jobNoteFormSchema>
