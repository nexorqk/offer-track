"use client"

import { startTransition, useActionState } from "react"
import * as React from "react"
import { useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form"

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
  const {
    formState,
    getValues,
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<JobFormValues>({
    defaultValues: initialValues,
  })

  React.useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  React.useEffect(() => {
    if (!state.fieldErrors) {
      return
    }

    for (const [fieldName, messages] of Object.entries(state.fieldErrors)) {
      const message = messages?.[0]

      if (!message) {
        continue
      }

      setError(fieldName as JobFormFieldName, {
        message,
        type: "server",
      })
    }
  }, [setError, state.fieldErrors])

  const submitForm = handleSubmit((_, event) => {
    const form = event?.currentTarget

    if (!(form instanceof HTMLFormElement)) {
      return
    }

    startTransition(() => {
      formAction(new FormData(form))
    })
  })

  return (
    <form onSubmit={submitForm} className="grid gap-5">
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
            error={getFieldError(formState.errors, state, "title")}
            label="Role title"
            name="title"
            placeholder="Senior Frontend Engineer"
            registration={register("title", {
              required: "Job title is required",
            })}
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
                getFieldError(formState.errors, state, "companyName") ? "true" : "false"
              }
              {...register("companyName", {
                required: "Company name is required",
              })}
            />
            <datalist id="job-company-options">
              {companyOptions.map((companyName) => (
                <option key={companyName} value={companyName} />
              ))}
            </datalist>
            <FieldError error={getFieldError(formState.errors, state, "companyName")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            error={getFieldError(formState.errors, state, "status")}
            label="Status"
            name="status"
            options={jobStatusOptions.map((value) => ({
              label: formatStatusLabel(value),
              value,
            }))}
            registration={register("status")}
          />
          <SelectField
            error={getFieldError(formState.errors, state, "priority")}
            label="Priority"
            name="priority"
            options={jobPriorityOptions.map((value) => ({
              label: value[0].toUpperCase() + value.slice(1),
              value,
            }))}
            registration={register("priority")}
          />
          <SelectField
            error={getFieldError(formState.errors, state, "workMode")}
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
            error={getFieldError(formState.errors, state, "location")}
            label="Location"
            name="location"
            placeholder="Remote, EU"
            registration={register("location")}
          />
          <Field
            error={getFieldError(formState.errors, state, "employmentType")}
            label="Employment type"
            name="employmentType"
            placeholder="full-time"
            registration={register("employmentType")}
          />
          <Field
            error={getFieldError(formState.errors, state, "source")}
            label="Source"
            name="source"
            placeholder="LinkedIn"
            registration={register("source")}
          />
          <Field
            error={getFieldError(formState.errors, state, "sourceUrl")}
            label="Source URL"
            name="sourceUrl"
            placeholder="https://..."
            registration={register("sourceUrl", {
              validate: (value) =>
                !value || URL.canParse(value) || "Enter a valid source URL",
            })}
          />
          <Field
            error={getFieldError(formState.errors, state, "appliedAt")}
            label="Applied at"
            name="appliedAt"
            type="date"
            registration={register("appliedAt")}
          />
          <Field
            error={getFieldError(formState.errors, state, "currency")}
            label="Currency"
            name="currency"
            placeholder="USD"
            registration={register("currency")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            error={getFieldError(formState.errors, state, "salaryMin")}
            label="Salary min"
            name="salaryMin"
            placeholder="4500"
            type="number"
            registration={register("salaryMin", {
              validate: (value) =>
                !value || isWholeNumber(value) || "Enter a whole number",
            })}
          />
          <Field
            error={getFieldError(formState.errors, state, "salaryMax")}
            label="Salary max"
            name="salaryMax"
            placeholder="5500"
            type="number"
            registration={register("salaryMax", {
              validate: (value) => {
                if (value && !isWholeNumber(value)) {
                  return "Enter a whole number"
                }

                const salaryMin = getValues("salaryMin")

                if (salaryMin && value && Number(value) < Number(salaryMin)) {
                  return "Maximum salary must be greater than or equal to minimum salary"
                }

                return true
              },
            })}
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
          <FieldError error={getFieldError(formState.errors, state, "description")} />
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
  state: JobFormState,
  fieldName: JobFormFieldName,
) {
  const clientError = clientErrors[fieldName]?.message

  if (typeof clientError === "string" && clientError.length > 0) {
    return clientError
  }

  return state.fieldErrors?.[fieldName]?.[0]
}

function isWholeNumber(value: string) {
  return /^\d+$/.test(value)
}

function formatStatusLabel(value: string) {
  if (value === "hr_screen") {
    return "HR screen"
  }

  return value[0].toUpperCase() + value.slice(1)
}
