"use client"

import type {
  FieldValues,
  Path,
  Resolver,
  UseFormClearErrors,
  UseFormSetError,
} from "react-hook-form"
import * as React from "react"
import { z } from "zod"

export function zodFormResolver<TValues extends FieldValues>(
  schema: z.ZodTypeAny,
): Resolver<TValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values)

    if (result.success) {
      return {
        errors: {},
        values,
      }
    }

    const errors: Record<string, { message: string; type: string }> = {}

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0]

      if (typeof fieldName !== "string" || fieldName in errors) {
        continue
      }

      errors[fieldName] = {
        message: issue.message,
        type: issue.code,
      }
    }

    return {
      errors: errors as never,
      values: {} as TValues,
    }
  }
}

export function syncServerFieldErrors<TValues extends FieldValues>(
  fieldErrors: Partial<Record<string, string[]>> | undefined,
  clearErrors: UseFormClearErrors<TValues>,
  setError: UseFormSetError<TValues>,
) {
  if (!fieldErrors) {
    return
  }

  clearErrors()

  for (const [fieldName, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0]

    if (!message) {
      continue
    }

    setError(fieldName as Path<TValues>, {
      message,
      type: "server",
    })
  }
}

export function useValidatedNativeSubmit(handleSubmit: any) {
  const allowNativeSubmitRef = React.useRef(false)
  const validateBeforeSubmit = handleSubmit(
    () => {
      allowNativeSubmitRef.current = true
    },
    () => {
      allowNativeSubmitRef.current = false
    },
  )

  return React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (allowNativeSubmitRef.current) {
        allowNativeSubmitRef.current = false
        return
      }

      const form = event.currentTarget

      void validateBeforeSubmit(event).then(() => {
        if (!allowNativeSubmitRef.current) {
          return
        }

        form.requestSubmit()
      })
    },
    [validateBeforeSubmit],
  )
}
