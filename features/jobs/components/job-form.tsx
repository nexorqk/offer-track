"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  jobPriorityOptions,
  jobStatusOptions,
  workModeOptions,
} from "@/features/jobs/schemas/job"
import {
  initialJobFormState,
  type JobFormFieldName,
  type JobFormState,
  type JobFormValues,
} from "@/features/jobs/types/job"

type JobFormProps = {
  action: (
    state: JobFormState,
    formData: FormData
  ) => Promise<JobFormState>
  companyOptions: string[]
  description: string
  initialValues: JobFormValues
  jobId?: string
  submitLabel: string
  title: string
}

const selectClassName =
  "flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const textareaClassName =
  "flex min-h-32 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function JobForm({
  action,
  companyOptions,
  description,
  initialValues,
  jobId,
  submitLabel,
  title,
}: Readonly<JobFormProps>) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialJobFormState,
  )

  return (
    <form action={formAction} className="grid gap-5">
      {jobId ? <input type="hidden" name="jobId" value={jobId} /> : null}

      <div className="flex flex-col gap-2">
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Jobs
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <section className="grid gap-4 rounded-[1.75rem] border bg-background/80 p-4">
        <div className="grid gap-4 md:grid-cols-[1.3fr_0.9fr]">
          <Field
            defaultValue={initialValues.title}
            error={getFieldError(state, "title")}
            label="Role title"
            name="title"
            placeholder="Senior Frontend Engineer"
          />
          <div className="grid gap-2">
            <label htmlFor="companyName" className="text-sm font-medium">
              Company
            </label>
            <Input
              id="companyName"
              name="companyName"
              list="job-company-options"
              defaultValue={initialValues.companyName}
              placeholder="Atlas Labs"
              aria-invalid={getFieldError(state, "companyName") ? "true" : "false"}
            />
            <datalist id="job-company-options">
              {companyOptions.map((companyName) => (
                <option key={companyName} value={companyName} />
              ))}
            </datalist>
            <FieldError error={getFieldError(state, "companyName")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            defaultValue={initialValues.status}
            error={getFieldError(state, "status")}
            label="Status"
            name="status"
            options={jobStatusOptions.map((value) => ({
              label: formatStatusLabel(value),
              value,
            }))}
          />
          <SelectField
            defaultValue={initialValues.priority}
            error={getFieldError(state, "priority")}
            label="Priority"
            name="priority"
            options={jobPriorityOptions.map((value) => ({
              label: value[0].toUpperCase() + value.slice(1),
              value,
            }))}
          />
          <SelectField
            defaultValue={initialValues.workMode}
            error={getFieldError(state, "workMode")}
            label="Work mode"
            name="workMode"
            options={[
              { label: "Not specified", value: "" },
              ...workModeOptions.map((value) => ({
                label: value[0].toUpperCase() + value.slice(1),
                value,
              })),
            ]}
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-[1.75rem] border bg-background/80 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            defaultValue={initialValues.location}
            error={getFieldError(state, "location")}
            label="Location"
            name="location"
            placeholder="Remote, EU"
          />
          <Field
            defaultValue={initialValues.employmentType}
            error={getFieldError(state, "employmentType")}
            label="Employment type"
            name="employmentType"
            placeholder="full-time"
          />
          <Field
            defaultValue={initialValues.source}
            error={getFieldError(state, "source")}
            label="Source"
            name="source"
            placeholder="LinkedIn"
          />
          <Field
            defaultValue={initialValues.sourceUrl}
            error={getFieldError(state, "sourceUrl")}
            label="Source URL"
            name="sourceUrl"
            placeholder="https://..."
          />
          <Field
            defaultValue={initialValues.appliedAt}
            error={getFieldError(state, "appliedAt")}
            label="Applied at"
            name="appliedAt"
            type="date"
          />
          <Field
            defaultValue={initialValues.currency}
            error={getFieldError(state, "currency")}
            label="Currency"
            name="currency"
            placeholder="USD"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            defaultValue={initialValues.salaryMin}
            error={getFieldError(state, "salaryMin")}
            label="Salary min"
            name="salaryMin"
            placeholder="4500"
            type="number"
          />
          <Field
            defaultValue={initialValues.salaryMax}
            error={getFieldError(state, "salaryMax")}
            label="Salary max"
            name="salaryMax"
            placeholder="5500"
            type="number"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialValues.description}
            className={textareaClassName}
            placeholder="Role scope, prep notes, and anything worth remembering."
          />
          <FieldError error={getFieldError(state, "description")} />
        </div>
      </section>

      {state.status === "error" && state.message ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <Button size="lg" type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  )
}

function Field({
  defaultValue,
  error,
  label,
  name,
  placeholder,
  type = "text",
}: {
  defaultValue: string
  error?: string
  label: string
  name: string
  placeholder?: string
  type?: React.ComponentProps<typeof Input>["type"]
}) {
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
      />
      <FieldError error={error} id={describedBy} />
    </div>
  )
}

function SelectField({
  defaultValue,
  error,
  label,
  name,
  options,
}: {
  defaultValue: string
  error?: string
  label: string
  name: string
  options: Array<{ label: string; value: string }>
}) {
  const describedBy = error ? `${name}-error` : undefined

  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={selectClassName}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
      >
        {options.map((option) => (
          <option key={option.value || "blank"} value={option.value}>
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
}: {
  error?: string
  id?: string
}) {
  return error ? (
    <p id={id} className="text-sm text-destructive">
      {error}
    </p>
  ) : null
}

function getFieldError(state: JobFormState, fieldName: JobFormFieldName) {
  return state.fieldErrors?.[fieldName]?.[0]
}

function formatStatusLabel(value: string) {
  if (value === "hr_screen") {
    return "HR screen"
  }

  return value[0].toUpperCase() + value.slice(1)
}
