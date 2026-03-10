import { z } from "zod"

export const interviewTypeOptions = ["hr", "technical", "final"] as const

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

const optionalText = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined)

const optionalPositiveInteger = z
  .string()
  .optional()
  .transform((value) => {
    const normalized = value?.trim()

    if (!normalized) {
      return undefined
    }

    const parsed = Number(normalized)

    return Number.isFinite(parsed) ? parsed : Number.NaN
  })
  .refine(
    (value) => value === undefined || (Number.isInteger(value) && value > 0),
    "Enter a whole number",
  )

const timezoneOffsetMinutesSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) {
      return 0
    }

    const parsed = Number(value)

    return Number.isInteger(parsed) ? parsed : 0
  })

export const interviewFormSchema = z
  .object({
    durationMinutes: optionalPositiveInteger,
    location: optionalText,
    notes: optionalText,
    result: optionalText,
    scheduledAt: requiredText("Interview time"),
    timezoneOffsetMinutes: timezoneOffsetMinutesSchema,
    type: z.enum(interviewTypeOptions),
  })
  .superRefine((value, context) => {
    if (
      parseInterviewScheduledAt(
        value.scheduledAt,
        value.timezoneOffsetMinutes,
      ) === null
    ) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid interview date and time",
        path: ["scheduledAt"],
      })
    }
  })
  .transform((value) => ({
    durationMinutes: value.durationMinutes,
    location: value.location,
    notes: value.notes,
    result: value.result,
    scheduledAt: parseInterviewScheduledAt(
      value.scheduledAt,
      value.timezoneOffsetMinutes,
    ) as Date,
    type: value.type,
  }))

export type InterviewFormInput = z.infer<typeof interviewFormSchema>

export function parseInterviewScheduledAt(
  value: string,
  timezoneOffsetMinutes: number,
) {
  const normalized = value.trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(normalized)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const localReference = new Date(
    Date.UTC(year, monthIndex, day, hour, minute),
  )

  if (
    localReference.getUTCFullYear() !== year ||
    localReference.getUTCMonth() !== monthIndex ||
    localReference.getUTCDate() !== day ||
    localReference.getUTCHours() !== hour ||
    localReference.getUTCMinutes() !== minute
  ) {
    return null
  }

  return new Date(
    localReference.getTime() + timezoneOffsetMinutes * 60_000,
  )
}
