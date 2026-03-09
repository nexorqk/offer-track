"use client"

import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  initialAuthFormState,
  type AuthFormState,
} from "@/features/auth/types/auth"

type AuthFormProps = {
  action: (
    state: AuthFormState,
    formData: FormData
  ) => Promise<AuthFormState>
  alternateHref: string
  alternateLabel: string
  alternateText: string
  description: string
  mode: "login" | "register"
  redirectTo?: string
  submitLabel: string
  title: string
}

function getFieldError(state: AuthFormState, fieldName: keyof NonNullable<AuthFormState["fieldErrors"]>) {
  return state.fieldErrors?.[fieldName]?.[0]
}

export function AuthForm({
  action,
  alternateHref,
  alternateLabel,
  alternateText,
  description,
  mode,
  redirectTo,
  submitLabel,
  title,
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialAuthFormState
  )

  const emailError = getFieldError(state, "email")
  const passwordError = getFieldError(state, "password")
  const confirmPasswordError = getFieldError(state, "confirmPassword")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Auth
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={emailError ? "true" : "false"}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError ? (
            <p id="email-error" className="text-sm text-destructive">
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            aria-invalid={passwordError ? "true" : "false"}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          {passwordError ? (
            <p id="password-error" className="text-sm text-destructive">
              {passwordError}
            </p>
          ) : null}
        </div>

        {mode === "register" ? (
          <div className="grid gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              aria-invalid={confirmPasswordError ? "true" : "false"}
              aria-describedby={
                confirmPasswordError ? "confirm-password-error" : undefined
              }
            />
            {confirmPasswordError ? (
              <p
                id="confirm-password-error"
                className="text-sm text-destructive"
              >
                {confirmPasswordError}
              </p>
            ) : null}
          </div>
        ) : null}

        {state.status === "error" && state.message ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </div>
        ) : null}

        <Button size="lg" type="submit" disabled={isPending}>
          {isPending ? "Please wait..." : submitLabel}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {alternateText}{" "}
        <Link href={alternateHref} className="text-foreground underline">
          {alternateLabel}
        </Link>
      </p>
    </div>
  )
}
