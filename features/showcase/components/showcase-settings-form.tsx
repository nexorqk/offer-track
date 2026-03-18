"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateShowcaseSettingsAction } from "@/features/showcase/server/actions"
import {
  initialShowcaseSettingsState,
  type ShowcaseSettingsValues,
} from "@/features/showcase/types/showcase"

type ShowcaseSettingsFormProps = {
  initialValues: ShowcaseSettingsValues
}

export function ShowcaseSettingsForm({
  initialValues,
}: Readonly<ShowcaseSettingsFormProps>) {
  const [state, formAction, isPending] = useActionState(
    updateShowcaseSettingsAction,
    initialShowcaseSettingsState,
  )
  const publicUrl = initialValues.showcaseSlug
    ? `/showcase/${initialValues.showcaseSlug}`
    : null

  return (
    <section className="grid gap-4 pb-8 xl:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-[2rem] border bg-background/90 p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Workspace
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">
            Public showcase
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Publish a lighter public-facing view of selected jobs and
            reflection notes without exposing your private workspace.
          </p>
        </div>

        <form action={formAction} className="mt-6 grid gap-5">
          <label className="flex items-start gap-3 rounded-2xl border bg-muted/20 px-4 py-4">
            <input
              type="checkbox"
              name="showcaseEnabled"
              defaultChecked={initialValues.showcaseEnabled}
              className="mt-1 size-4 rounded border-input"
            />
            <div className="grid gap-1">
              <span className="text-sm font-medium">Enable public showcase</span>
              <span className="text-sm text-muted-foreground">
                When enabled, your public slug becomes a live read-only page.
              </span>
            </div>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              defaultValue={initialValues.showcaseSlug}
              error={state.fieldErrors?.showcaseSlug?.[0]}
              label="Public slug"
              name="showcaseSlug"
              placeholder="alex-job-search"
            />
            <Field
              defaultValue={initialValues.showcaseTitle}
              error={state.fieldErrors?.showcaseTitle?.[0]}
              label="Showcase title"
              name="showcaseTitle"
              placeholder="Alex's search journal"
            />
          </div>

          <TextAreaField
            defaultValue={initialValues.showcaseIntro}
            error={state.fieldErrors?.showcaseIntro?.[0]}
            label="Intro"
            name="showcaseIntro"
            placeholder="Short public framing for what this search is about."
          />

          <TextAreaField
            defaultValue={initialValues.showcaseBio}
            error={state.fieldErrors?.showcaseBio?.[0]}
            label="Bio"
            name="showcaseBio"
            placeholder="Optional context about your focus, role targets, or search constraints."
          />

          {state.message ? (
            <div
              role="alert"
              className={
                state.status === "success"
                  ? "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
                  : "rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              }
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save showcase settings"}
            </Button>
            {publicUrl ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                Open current showcase
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">
                Add a slug to generate the public route.
              </span>
            )}
          </div>
        </form>
      </article>

      <article className="rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,242,236,0.92))] p-6 shadow-sm">
        <div className="flex h-full flex-col justify-between gap-6">
          <div className="grid gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              What goes public
            </h2>
            <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
              <li>Selected jobs with safe public summaries</li>
              <li>Reflection and update notes only</li>
              <li>No contacts, interviews, tasks, or internal notes</li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-background/70 px-4 py-4 text-sm text-muted-foreground">
            Private dashboard keeps the operational `Soft Bronze` shell. Public
            showcase stays lighter and more editorial.
          </div>
        </div>
      </article>
    </section>
  )
}

function Field({
  defaultValue,
  error,
  label,
  name,
  placeholder,
}: Readonly<{
  defaultValue: string
  error?: string
  label: string
  name: string
  placeholder?: string
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
      />
      <FieldError error={error} id={describedBy} />
    </div>
  )
}

function TextAreaField({
  defaultValue,
  error,
  label,
  name,
  placeholder,
}: Readonly<{
  defaultValue: string
  error?: string
  label: string
  name: string
  placeholder?: string
}>) {
  const describedBy = error ? `${name}-error` : undefined

  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className="flex min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
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
