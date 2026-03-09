"use server"

import type { ZodError } from "zod"
import { redirect } from "next/navigation"

import { loginSchema, registerSchema } from "@/features/auth/schemas/auth"
import {
  clearSession,
  createSession,
  createUser,
  findUserByEmail,
} from "@/features/auth/server/auth"
import { hashPassword, verifyPassword } from "@/features/auth/server/password"
import type { AuthFormState } from "@/features/auth/types/auth"

function getFieldErrors(error: ZodError): AuthFormState["fieldErrors"] {
  return error.flatten().fieldErrors
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  )
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: getFieldErrors(parsed.error),
      message: "Fix the highlighted fields and try again.",
    }
  }

  const user = await findUserByEmail(parsed.data.email)

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return {
      status: "error",
      message: "Invalid email or password.",
    }
  }

  await createSession(user.id)
  redirect("/dashboard")
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
    confirmPassword: getString(formData, "confirmPassword"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: getFieldErrors(parsed.error),
      message: "Fix the highlighted fields and try again.",
    }
  }

  try {
    const user = await createUser(
      parsed.data.email,
      await hashPassword(parsed.data.password)
    )

    await createSession(user.id)
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        fieldErrors: {
          email: ["An account with this email already exists"],
        },
        message: "Use a different email or log in instead.",
      }
    }

    throw error
  }

  redirect("/dashboard")
}

export async function logoutAction() {
  await clearSession()
  redirect("/login")
}
