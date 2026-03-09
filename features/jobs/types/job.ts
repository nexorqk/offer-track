import type { JobFormInput } from "@/features/jobs/schemas/job"

export type JobFormValues = {
  appliedAt: string
  companyName: string
  currency: string
  description: string
  employmentType: string
  location: string
  priority: string
  salaryMax: string
  salaryMin: string
  source: string
  sourceUrl: string
  status: string
  title: string
  workMode: string
}

export type JobFormFieldName = keyof JobFormValues

export type JobFormState = {
  fieldErrors?: Partial<Record<JobFormFieldName, string[]>>
  message?: string
  status: "error" | "idle"
}

export const initialJobFormState: JobFormState = {
  status: "idle",
}

export const emptyJobFormValues: JobFormValues = {
  appliedAt: "",
  companyName: "",
  currency: "",
  description: "",
  employmentType: "",
  location: "",
  priority: "medium",
  salaryMax: "",
  salaryMin: "",
  source: "",
  sourceUrl: "",
  status: "wishlist",
  title: "",
  workMode: "",
}

export type JobFormInitialData = {
  id: string
} & JobFormValues

export type JobListItem = {
  appliedAt: Date | null
  companyName: string
  id: string
  location: string | null
  priority: string
  salaryMax: number | null
  salaryMin: number | null
  status: NonNullable<JobFormInput["status"]>
  title: string
  updatedAt: Date
  workMode: NonNullable<JobFormInput["workMode"]> | null
}

export function toJobFormValues(input: Partial<JobFormInput>): JobFormValues {
  return {
    appliedAt: input.appliedAt ? formatDateForInput(input.appliedAt) : "",
    companyName: input.companyName ?? "",
    currency: input.currency ?? "",
    description: input.description ?? "",
    employmentType: input.employmentType ?? "",
    location: input.location ?? "",
    priority: input.priority ?? "medium",
    salaryMax:
      typeof input.salaryMax === "number" ? String(input.salaryMax) : "",
    salaryMin:
      typeof input.salaryMin === "number" ? String(input.salaryMin) : "",
    source: input.source ?? "",
    sourceUrl: input.sourceUrl ?? "",
    status: input.status ?? "wishlist",
    title: input.title ?? "",
    workMode: input.workMode ?? "",
  }
}

function formatDateForInput(value: Date) {
  return value.toISOString().slice(0, 10)
}
