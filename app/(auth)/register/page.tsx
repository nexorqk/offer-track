import { redirect } from "next/navigation"

import { AuthForm } from "@/features/auth/components/auth-form"
import { getCurrentUser } from "@/features/auth/server/auth"
import { registerAction } from "@/features/auth/server/actions"

export default async function RegisterPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <AuthForm
      action={registerAction}
      alternateHref="/login"
      alternateLabel="Log in"
      alternateText="Already have an account?"
      description="Create your account to keep applications, interviews, and offers in one place."
      mode="register"
      submitLabel="Create account"
      title="Create account"
    />
  )
}
