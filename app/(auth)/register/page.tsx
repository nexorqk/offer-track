import { redirect } from "next/navigation"

import { AuthForm } from "@/features/auth/components/auth-form"
import { normalizeRedirectTarget } from "@/features/auth/route-protection"
import { getCurrentUser } from "@/features/auth/server/auth"
import { registerAction } from "@/features/auth/server/actions"

type RegisterPageProps = {
  searchParams: Promise<{
    redirectTo?: string
  }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirectTo } = await searchParams
  const user = await getCurrentUser()
  const nextPath = normalizeRedirectTarget(redirectTo)

  if (user) {
    redirect(nextPath)
  }

  return (
    <AuthForm
      action={registerAction}
      alternateHref="/login"
      alternateLabel="Log in"
      alternateText="Already have an account?"
      description="Create your account to keep applications, interviews, and offers in one place."
      mode="register"
      redirectTo={nextPath}
      submitLabel="Create account"
      title="Create account"
    />
  )
}
