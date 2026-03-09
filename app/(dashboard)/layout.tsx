import { requireCurrentUser } from "@/features/auth/server/auth"

import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireCurrentUser()

  return <DashboardShell userEmail={user.email}>{children}</DashboardShell>
}
