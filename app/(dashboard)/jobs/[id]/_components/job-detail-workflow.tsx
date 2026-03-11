"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarClock,
  CalendarPlus2,
  NotebookText,
  UserRoundPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  createJobContactAction,
  createJobInterviewAction,
  createJobNoteAction,
  createJobTaskAction,
} from "@/features/jobs/server/actions"
import {
  initialJobContactState,
  initialJobInterviewState,
  initialJobNoteState,
  initialJobTaskState,
  type JobContactListItem,
  type JobDetailMutationState,
  type JobInterviewListItem,
  type JobNoteListItem,
  type JobTaskListItem,
} from "@/features/jobs/types/job-detail"

export function JobDetailWorkflow({
  contacts,
  interviews,
  jobId,
  notes,
  tasks,
}: Readonly<{
  contacts: JobContactListItem[]
  interviews: JobInterviewListItem[]
  jobId: string
  notes: JobNoteListItem[]
  tasks: JobTaskListItem[]
}>) {
  return (
    <div className="grid gap-5">
      <ContactPanel contacts={contacts} jobId={jobId} />
      <InterviewPanel interviews={interviews} jobId={jobId} />
      <TaskPanel jobId={jobId} tasks={tasks} />
      <NotePanel jobId={jobId} notes={notes} />
    </div>
  )
}

function ContactPanel({
  contacts,
  jobId,
}: Readonly<{
  contacts: JobContactListItem[]
  jobId: string
}>) {
  const [state, action, isPending] = useActionState(
    createJobContactAction,
    initialJobContactState,
  )
  useRefreshOnSuccess(state.status)

  return (
    <WorkflowCard
      description="Add the recruiter, hiring manager, or anyone tied to this opening."
      icon={UserRoundPlus}
      title="Contacts"
    >
      <WorkflowForm
        action={action}
        isPending={isPending}
        jobId={jobId}
        resetOnSuccess={state.status === "success"}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            error={getFieldError(state, "name")}
            label="Name"
            name="name"
            placeholder="Jane Recruiter"
          />
          <Field
            error={getFieldError(state, "role")}
            label="Role"
            name="role"
            placeholder="Senior Recruiter"
          />
          <Field
            error={getFieldError(state, "email")}
            label="Email"
            name="email"
            placeholder="jane@company.com"
            type="email"
          />
          <Field
            error={getFieldError(state, "linkedinUrl")}
            label="LinkedIn"
            name="linkedinUrl"
            placeholder="https://linkedin.com/in/jane"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="contact-notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="contact-notes"
            name="notes"
            className={textareaClassName}
            placeholder="Warm intro, timezone, preferred follow-up cadence."
          />
          <FieldError error={getFieldError(state, "notes")} />
        </div>

        <FormStateMessage state={state} />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Add contact"}
        </Button>
      </WorkflowForm>

      <div className="grid gap-3">
        {contacts.length === 0 ? (
          <EmptyState>No contacts yet for this role.</EmptyState>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="rounded-[1.25rem] border bg-muted/15 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <strong className="text-sm font-semibold">{contact.name}</strong>
                  <span className="text-sm text-muted-foreground">
                    {contact.role ?? "Role not specified"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatShortDate(contact.createdAt)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {contact.email ? <span>{contact.email}</span> : null}
                {contact.linkedinUrl ? <span>{contact.linkedinUrl}</span> : null}
              </div>
              {contact.notes ? (
                <p className="mt-3 text-sm text-muted-foreground">{contact.notes}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </WorkflowCard>
  )
}

function InterviewPanel({
  interviews,
  jobId,
}: Readonly<{
  interviews: JobInterviewListItem[]
  jobId: string
}>) {
  const [state, action, isPending] = useActionState(
    createJobInterviewAction,
    initialJobInterviewState,
  )
  useRefreshOnSuccess(state.status)
  const [timezoneOffsetMinutes, setTimezoneOffsetMinutes] = React.useState(0)

  React.useEffect(() => {
    setTimezoneOffsetMinutes(new Date().getTimezoneOffset())
  }, [])

  return (
    <WorkflowCard
      description="Keep every screen, panel, and final loop tied directly to the role."
      icon={CalendarClock}
      title="Interviews"
    >
      <WorkflowForm
        action={action}
        isPending={isPending}
        jobId={jobId}
        resetOnSuccess={state.status === "success"}
      >
        <input
          type="hidden"
          name="timezoneOffsetMinutes"
          value={String(timezoneOffsetMinutes)}
        />

        <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)_10rem]">
          <SelectField
            error={getFieldError(state, "type")}
            label="Type"
            name="type"
            options={[
              { label: "HR", value: "hr" },
              { label: "Technical", value: "technical" },
              { label: "Final", value: "final" },
            ]}
          />
          <Field
            error={getFieldError(state, "scheduledAt")}
            label="Scheduled for"
            name="scheduledAt"
            type="datetime-local"
          />
          <Field
            error={getFieldError(state, "durationMinutes")}
            label="Duration"
            name="durationMinutes"
            placeholder="45"
            type="number"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            error={getFieldError(state, "location")}
            label="Location"
            name="location"
            placeholder="Zoom / onsite / phone"
          />
          <Field
            error={getFieldError(state, "result")}
            label="Result"
            name="result"
            placeholder="Advanced to onsite"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="interview-notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="interview-notes"
            name="notes"
            className={textareaClassName}
            placeholder="Prep themes, panel names, takeaways, and follow-up context."
          />
          <FieldError error={getFieldError(state, "notes")} />
        </div>

        <FormStateMessage state={state} />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Add interview"}
        </Button>
      </WorkflowForm>

      <div className="grid gap-3">
        {interviews.length === 0 ? (
          <EmptyState>No interviews scheduled for this role yet.</EmptyState>
        ) : (
          interviews.map((interview) => (
            <div key={interview.id} className="rounded-[1.25rem] border bg-muted/15 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <strong className="text-sm font-semibold">
                    {formatInterviewType(interview.type)} interview
                  </strong>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(interview.scheduledAt)}
                  </span>
                </div>
                {interview.result ? (
                  <span className="rounded-full border px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {interview.result}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {interview.durationMinutes ? (
                  <span>{interview.durationMinutes} min</span>
                ) : null}
                {interview.location ? <span>{interview.location}</span> : null}
              </div>

              {interview.notes ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {interview.notes}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </WorkflowCard>
  )
}

function TaskPanel({
  jobId,
  tasks,
}: Readonly<{
  jobId: string
  tasks: JobTaskListItem[]
}>) {
  const [state, action, isPending] = useActionState(
    createJobTaskAction,
    initialJobTaskState,
  )
  useRefreshOnSuccess(state.status)

  return (
    <WorkflowCard
      description="Capture the next follow-up before the thread goes stale."
      icon={CalendarPlus2}
      title="Follow-up tasks"
    >
      <WorkflowForm
        action={action}
        isPending={isPending}
        jobId={jobId}
        resetOnSuccess={state.status === "success"}
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto]">
          <Field
            error={getFieldError(state, "title")}
            label="Task"
            name="title"
            placeholder="Send follow-up after HR screen"
          />
          <Field
            error={getFieldError(state, "dueDate")}
            label="Due date"
            name="dueDate"
            type="date"
          />
          <div className="flex items-end">
            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
              {isPending ? "Saving..." : "Add task"}
            </Button>
          </div>
        </div>

        <FormStateMessage state={state} />
      </WorkflowForm>

      <div className="grid gap-3">
        {tasks.length === 0 ? (
          <EmptyState>No follow-up tasks yet.</EmptyState>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="rounded-[1.25rem] border bg-muted/15 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <strong className="text-sm font-semibold">{task.title}</strong>
                  <span className="text-sm text-muted-foreground">
                    {task.dueDate
                      ? `Due ${formatShortDate(task.dueDate)}`
                      : "No deadline yet"}
                  </span>
                </div>
                <span className="rounded-full border px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {task.completed ? "Done" : "Open"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </WorkflowCard>
  )
}

function NotePanel({
  jobId,
  notes,
}: Readonly<{
  jobId: string
  notes: JobNoteListItem[]
}>) {
  const [state, action, isPending] = useActionState(
    createJobNoteAction,
    initialJobNoteState,
  )
  useRefreshOnSuccess(state.status)

  return (
    <WorkflowCard
      description="Log the signal right after a call while it is still fresh."
      icon={NotebookText}
      title="Notes"
    >
      <WorkflowForm
        action={action}
        isPending={isPending}
        jobId={jobId}
        resetOnSuccess={state.status === "success"}
      >
        <div className="grid gap-2">
          <label htmlFor="job-note" className="text-sm font-medium">
            New note
          </label>
          <textarea
            id="job-note"
            name="content"
            className={textareaClassName}
            placeholder="Candidate signal, prep notes, post-interview takeaways."
          />
          <FieldError error={getFieldError(state, "content")} />
        </div>

        <FormStateMessage state={state} />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save note"}
        </Button>
      </WorkflowForm>

      <div className="grid gap-3">
        {notes.length === 0 ? (
          <EmptyState>No notes yet for this opportunity.</EmptyState>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="rounded-[1.25rem] border bg-muted/15 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <strong className="text-sm font-semibold">Job note</strong>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(note.updatedAt)}
                </span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </WorkflowCard>
  )
}

function WorkflowCard({
  children,
  description,
  icon: Icon,
  title,
}: Readonly<{
  children: React.ReactNode
  description: string
  icon: React.ComponentType<{ className?: string }>
  title: string
}>) {
  return (
    <article className="rounded-[2rem] border bg-background/92 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Workflow
          </span>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Icon className="size-4" />
        </div>
      </div>

      <div className="mt-4 grid gap-4">{children}</div>
    </article>
  )
}

function WorkflowForm({
  action,
  children,
  isPending,
  jobId,
  resetOnSuccess,
}: Readonly<{
  action: (payload: FormData) => void
  children: React.ReactNode
  isPending: boolean
  jobId: string
  resetOnSuccess: boolean
}>) {
  const formRef = React.useRef<HTMLFormElement>(null)

  React.useEffect(() => {
    if (!resetOnSuccess) {
      return
    }

    formRef.current?.reset()
  }, [resetOnSuccess])

  return (
    <form ref={formRef} action={action} className="grid gap-4">
      <input type="hidden" name="jobId" value={jobId} />
      {children}
      {isPending ? (
        <span className="text-xs text-muted-foreground">Submitting...</span>
      ) : null}
    </form>
  )
}

function Field({
  error,
  label,
  name,
  placeholder,
  type = "text",
}: Readonly<{
  error?: string
  label: string
  name: string
  placeholder?: string
  type?: React.ComponentProps<typeof Input>["type"]
}>) {
  const describedBy = error ? `${name}-error` : undefined

  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
      />
      <FieldError error={error} id={describedBy} />
    </div>
  )
}

function SelectField({
  error,
  label,
  name,
  options,
}: Readonly<{
  error?: string
  label: string
  name: string
  options: Array<{ label: string; value: string }>
}>) {
  const describedBy = error ? `${name}-error` : undefined

  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={selectClassName}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError error={error} id={describedBy} />
    </div>
  )
}

function FieldError({
  error,
  id,
}: Readonly<{
  error?: string
  id?: string
}>) {
  return error ? (
    <p id={id} className="text-sm text-destructive">
      {error}
    </p>
  ) : null
}

function FormStateMessage<FieldName extends string>({
  state,
}: Readonly<{
  state: JobDetailMutationState<FieldName>
}>) {
  if (!state.message) {
    return null
  }

  return (
    <div
      className={
        state.status === "success"
          ? "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
          : "rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      }
    >
      {state.message}
    </div>
  )
}

function EmptyState({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="rounded-[1.25rem] border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

function getFieldError<FieldName extends string>(
  state: JobDetailMutationState<FieldName>,
  fieldName: FieldName,
) {
  return state.fieldErrors?.[fieldName]?.[0]
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(value)
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(value)
}

function useRefreshOnSuccess(status: JobDetailMutationState<string>["status"]) {
  const router = useRouter()

  React.useEffect(() => {
    if (status !== "success") {
      return
    }

    router.refresh()
  }, [router, status])
}

function formatInterviewType(value: "final" | "hr" | "technical") {
  switch (value) {
    case "hr":
      return "HR"
    case "technical":
      return "Technical"
    case "final":
      return "Final"
  }
}

const selectClassName =
  "flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const textareaClassName =
  "flex min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
