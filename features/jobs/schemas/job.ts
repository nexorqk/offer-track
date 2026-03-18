import { z } from "zod"

import { visibilityProfileOptions } from "@/features/showcase/lib/visibility"

export const jobStatusOptions = [
  "wishlist",
  "applied",
  "hr_screen",
  "technical",
  "final",
  "offer",
  "rejected",
] as const

export const jobPriorityOptions = ["low", "medium", "high"] as const
export const workModeOptions = ["remote", "hybrid", "onsite"] as const

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

const optionalText = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined)

const optionalUrl = optionalText.refine(
  (value) => !value || URL.canParse(value),
  "Enter a valid source URL",
)

const optionalInteger = z
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
    (value) => value === undefined || (Number.isInteger(value) && value >= 0),
    "Enter a whole number",
  )

const optionalDate = z
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
  .refine((value) => value !== null, "Enter a valid application date")
  .transform((value) => value ?? undefined)

export const jobFormSchema = z
  .object({
    appliedAt: optionalDate,
    companyName: requiredText("Company name"),
    currency: optionalText.transform((value) => value?.toUpperCase()),
    description: optionalText,
    employmentType: optionalText,
    location: optionalText,
    priority: z.enum(jobPriorityOptions).optional().catch("medium"),
    publicSummary: optionalText,
    salaryMax: optionalInteger,
    salaryMin: optionalInteger,
    source: optionalText,
    sourceUrl: optionalUrl,
    status: z.enum(jobStatusOptions).optional().catch("wishlist"),
    title: requiredText("Job title"),
    visibilityProfile: z
      .enum(visibilityProfileOptions)
      .optional()
      .catch("private"),
    workMode: z.enum(workModeOptions).optional().catch(undefined),
  })
  .superRefine((value, context) => {
    if (
      value.salaryMin !== undefined &&
      value.salaryMax !== undefined &&
      value.salaryMax < value.salaryMin
    ) {
      context.addIssue({
        code: "custom",
        message: "Maximum salary must be greater than or equal to minimum salary",
        path: ["salaryMax"],
      })
    }
  })

export type JobFormInput = z.infer<typeof jobFormSchema>
