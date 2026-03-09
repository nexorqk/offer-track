export type AuthFieldName = "email" | "password" | "confirmPassword"

export type AuthFieldErrors = Partial<Record<AuthFieldName, string[]>>

export type AuthFormState = {
  status: "idle" | "error"
  message?: string
  fieldErrors?: AuthFieldErrors
}

export const initialAuthFormState: AuthFormState = {
  status: "idle",
}
