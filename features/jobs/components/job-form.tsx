"use client"

import { useActionState } from "react"
import * as React from "react"
import { useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jobFormSchema } from "@/features/jobs/schemas/job"
import {
  jobPriorityOptions,
  jobStatusOptions,
  workModeOptions,
} from "@/features/jobs/schemas/job"
import { visibilityProfileOptions } from "@/features/showcase/lib/visibility"
import {
  initialJobFormState,
  type JobFormFieldName,
  type JobFormState,
  type JobFormValues,
} from "@/features/jobs/types/job"
import {
  syncServerFieldErrors,
  useValidatedNativeSubmit,
  zodFormResolver,
} from "@/lib/forms/rhf-zod"

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
  const {
    clearErrors,
    formState,
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<JobFormValues>({
    defaultValues: initialValues,
    resolver: zodFormResolver<JobFormValues>(jobFormSchema),
  })

  React.useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  React.useEffect(() => {
    syncServerFieldErrors<JobFormValues>(state.fieldErrors, clearErrors, setError)
  }, [clearErrors, setError, state.fieldErrors])

  const submitForm = useValidatedNativeSubmit(handleSubmit)

  const errorSummary = getErrorSummary(formState.errors)
  const showClientErrorSummary =
    formState.submitCount > 0 && errorSummary.length > 0
  const showErrorSummary = Boolean(state.message) || showClientErrorSummary

  return (
    <form action={formAction} noValidate onSubmit={submitForm} className="grid gap-5">
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
            error={getFieldError(formState.errors, "title")}
            label="Role title"
            name="title"
            placeholder="Senior Frontend Engineer"
            registration={register("title")}
          />
          <div className="grid gap-2">
            <label htmlFor="companyName" className="text-sm font-medium">
              Company
            </label>
            <Input
              id="companyName"
              list="job-company-options"
              placeholder="Atlas Labs"
              aria-invalid={
                getFieldError(formState.errors, "companyName") ? "true" : "false"
              }
              {...register("companyName")}
            />
            <datalist id="job-company-options">
              {companyOptions.map((companyName) => (
                <option key={companyName} value={companyName} />
              ))}
            </datalist>
            <FieldError error={getFieldError(formState.errors, "companyName")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            error={getFieldError(formState.errors, "status")}
            label="Status"
            name="status"
            options={jobStatusOptions.map((value) => ({
              label: formatStatusLabel(value),
              value,
            }))}
            registration={register("status")}
          />
          <SelectField
            error={getFieldError(formState.errors, "priority")}
            label="Priority"
            name="priority"
            options={jobPriorityOptions.map((value) => ({
              label: value[0].toUpperCase() + value.slice(1),
              value,
            }))}
            registration={register("priority")}
          />
          <SelectField
            error={getFieldError(formState.errors, "workMode")}
            label="Work mode"
            name="workMode"
            options={[
              { label: "Not specified", value: "" },
              ...workModeOptions.map((value) => ({
                label: value[0].toUpperCase() + value.slice(1),
                value,
              })),
            ]}
            registration={register("workMode")}
          />
        </div>
      </section>

      <section className="grid gap-4 rounded-[1.75rem] border bg-background/80 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            error={getFieldError(formState.errors, "location")}
            label="Location"
            name="location"
            placeholder="Remote, EU"
            registration={register("location")}
          />
          <Field
            error={getFieldError(formState.errors, "employmentType")}
            label="Employment type"
            name="employmentType"
            placeholder="full-time"
            registration={register("employmentType")}
          />
          <Field
            error={getFieldError(formState.errors, "source")}
            label="Source"
            name="source"
            placeholder="LinkedIn"
            registration={register("source")}
          />
          <Field
            error={getFieldError(formState.errors, "sourceUrl")}
            label="Source URL"
            name="sourceUrl"
            placeholder="https://..."
            registration={register("sourceUrl")}
          />
          <Field
            error={getFieldError(formState.errors, "appliedAt")}
            label="Applied at"
            name="appliedAt"
            type="date"
            registration={register("appliedAt")}
          />
          <Field
            error={getFieldError(formState.errors, "currency")}
            label="Currency"
            name="currency"
            placeholder="USD"
            registration={register("currency")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            error={getFieldError(formState.errors, "salaryMin")}
            label="Salary min"
            name="salaryMin"
            placeholder="4500"
            type="number"
            registration={register("salaryMin")}
          />
          <Field
            error={getFieldError(formState.errors, "salaryMax")}
            label="Salary max"
            name="salaryMax"
            placeholder="5500"
            type="number"
            registration={register("salaryMax")}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            className={textareaClassName}
            placeholder="Role scope, prep notes, and anything worth remembering."
            {...register("description")}
          />
          <FieldError error={getFieldError(formState.errors, "description")} />
        </div>
      </section>

      <section className="grid gap-4 rounded-[1.75rem] border bg-background/80 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">Showcase</h2>
          <p className="text-sm text-muted-foreground">
            Keep the role private or prepare it for the public showcase.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <SelectField
            error={getFieldError(formState.errors, "visibilityProfile")}
            label="Visibility"
            name="visibilityProfile"
            options={visibilityProfileOptions.map((value) => ({
              label: formatVisibilityProfileLabel(value),
              value,
            }))}
            registration={register("visibilityProfile")}
          />

          <div className="grid gap-2">
            <label htmlFor="publicSummary" className="text-sm font-medium">
              Public summary
            </label>
            <textarea
              id="publicSummary"
              className={textareaClassName}
              placeholder="Short public-facing summary for the showcase page."
              {...register("publicSummary")}
            />
            <FieldError error={getFieldError(formState.errors, "publicSummary")} />
          </div>
        </div>
      </section>

      {showErrorSummary ? (
        <div
          aria-label="Form validation errors"
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <p>{state.message ?? "Fix the highlighted fields and try again."}</p>
          {errorSummary.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {errorSummary.map((error) => (
                <li key={error.fieldName}>{error.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Button size="lg" type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  )
}

function Field({
  error,
  label,
  name,
  placeholder,
  registration,
  type = "text",
}: {
  error?: string
  label: string
  name: string
  placeholder?: string
  registration: UseFormRegisterReturn
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
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        {...registration}
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
  registration,
}: {
  error?: string
  label: string
  name: string
  options: Array<{ label: string; value: string }>
  registration: UseFormRegisterReturn
}) {
  const describedBy = error ? `${name}-error` : undefined

  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        className={selectClassName}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        {...registration}
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

function getFieldError(
  clientErrors: FieldErrors<JobFormValues>,
  fieldName: JobFormFieldName,
) {
  const clientError = clientErrors[fieldName]?.message

  if (typeof clientError === "string" && clientError.length > 0) {
    return clientError
  }
}

function getErrorSummary(clientErrors: FieldErrors<JobFormValues>) {
  return Object.entries(clientErrors).flatMap(([fieldName, error]) => {
    const message = error?.message

    if (typeof message !== "string" || message.length === 0) {
      return []
    }

    return [
      {
        fieldName,
        message,
      },
    ]
  })
}

function formatStatusLabel(value: string) {
  if (value === "hr_screen") {
    return "HR screen"
  }

  return value[0].toUpperCase() + value.slice(1)
}

function formatVisibilityProfileLabel(value: string) {
  if (value === "public_showcase") {
    return "Public showcase"
  }

  return value[0].toUpperCase() + value.slice(1)
}
