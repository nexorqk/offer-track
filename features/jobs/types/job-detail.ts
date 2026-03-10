export type JobDetailMutationState<FieldName extends string> = {
  fieldErrors?: Partial<Record<FieldName, string[]>>
  message?: string
  status: "error" | "idle" | "success"
}

export type JobContactFieldName =
  | "email"
  | "linkedinUrl"
  | "name"
  | "notes"
  | "role"

export type JobTaskFieldName = "dueDate" | "title"

export type JobNoteFieldName = "content"

export type JobInterviewFieldName =
  | "durationMinutes"
  | "location"
  | "notes"
  | "result"
  | "scheduledAt"
  | "type"

export type JobContactListItem = {
  createdAt: Date
  email: string | null
  id: string
  linkedinUrl: string | null
  name: string
  notes: string | null
  role: string | null
}

export type JobTaskListItem = {
  completed: boolean
  createdAt: Date
  dueDate: Date | null
  id: string
  title: string
}

export type JobNoteListItem = {
  content: string
  createdAt: Date
  id: string
  updatedAt: Date
}

export type JobInterviewListItem = {
  createdAt: Date
  durationMinutes: number | null
  id: string
  location: string | null
  notes: string | null
  result: string | null
  scheduledAt: Date
  type: "final" | "hr" | "technical"
  updatedAt: Date
}

export const initialJobContactState: JobDetailMutationState<JobContactFieldName> = {
  status: "idle",
}

export const initialJobInterviewState: JobDetailMutationState<JobInterviewFieldName> = {
  status: "idle",
}

export const initialJobTaskState: JobDetailMutationState<JobTaskFieldName> = {
  status: "idle",
}

export const initialJobNoteState: JobDetailMutationState<JobNoteFieldName> = {
  status: "idle",
}
