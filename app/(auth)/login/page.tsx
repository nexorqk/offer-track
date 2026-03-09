import { redirect } from "next/navigation"

import { AuthForm } from "@/features/auth/components/auth-form"
import { getCurrentUser } from "@/features/auth/server/auth"
import { loginAction } from "@/features/auth/server/actions"

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <AuthForm
      action={loginAction}
      alternateHref="/register"
      alternateLabel="Create one"
      alternateText="Need an account?"
      description="Log in to your workspace and continue tracking your job search."
      mode="login"
      submitLabel="Log in"
      title="Log in"
    />
  )
}
