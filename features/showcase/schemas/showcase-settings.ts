import { z } from "zod"

export const showcaseSettingsSchema = z
  .object({
    showcaseBio: z
      .string()
      .optional()
      .transform((value) => value?.trim() || undefined),
    showcaseEnabled: z.boolean(),
    showcaseIntro: z
      .string()
      .optional()
      .transform((value) => value?.trim() || undefined),
    showcaseSlug: z
      .string()
      .optional()
      .transform((value) => value?.trim().toLowerCase() || undefined)
      .refine(
        (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
        "Use lowercase letters, numbers, and single hyphens only",
      ),
    showcaseTitle: z
      .string()
      .optional()
      .transform((value) => value?.trim() || undefined),
  })
  .superRefine((value, context) => {
    if (value.showcaseEnabled && !value.showcaseSlug) {
      context.addIssue({
        code: "custom",
        message: "Slug is required before you can enable the showcase.",
        path: ["showcaseSlug"],
      })
    }
  })

export type ShowcaseSettingsInput = z.infer<typeof showcaseSettingsSchema>
