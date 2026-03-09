import { z } from "zod"

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

const optionalText = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined)

export const contactFormSchema = z.object({
  email: optionalText.refine(
    (value) => !value || z.email().safeParse(value).success,
    "Enter a valid email address",
  ),
  linkedinUrl: optionalText.refine(
    (value) => !value || URL.canParse(value),
    "Enter a valid LinkedIn URL",
  ),
  name: requiredText("Contact name"),
  notes: optionalText,
  role: optionalText,
})

export type ContactFormInput = z.infer<typeof contactFormSchema>
