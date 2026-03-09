import { z } from "zod"

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const taskFormSchema = z.object({
  dueDate: z
    .string()
    .optional()
    .transform((value) => {
      const normalized = value?.trim()

      if (!normalized) {
        return undefined
      }

      const date = new Date(`${normalized}T00:00:00.000Z`)
      return Number.isNaN(date.getTime()) ? null : date
    })
    .refine((value) => value !== null, "Enter a valid due date")
    .transform((value) => value ?? undefined),
  title: requiredText("Task title"),
})

export type TaskFormInput = z.infer<typeof taskFormSchema>
