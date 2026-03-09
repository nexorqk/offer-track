import { redirect } from "next/navigation"

import { AuthForm } from "@/features/auth/components/auth-form"
import { normalizeRedirectTarget } from "@/features/auth/route-protection"
import { getCurrentUser } from "@/features/auth/server/auth"
import { loginAction } from "@/features/auth/server/actions"

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams
  const user = await getCurrentUser()
  const nextPath = normalizeRedirectTarget(redirectTo)

  if (user) {
    redirect(nextPath)
  }

  return (
    <AuthForm
      action={loginAction}
      alternateHref="/register"
      alternateLabel="Create one"
      alternateText="Need an account?"
      description="Log in to your workspace and continue tracking your job search."
      mode="login"
      redirectTo={nextPath}
      submitLabel="Log in"
      title="Log in"
    />
  )
}
