"use server"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { listCompaniesForUser } from "@/features/companies/server/queries"

export async function getCompaniesPageDataAction() {
  const user = await requireCurrentUser()

  return listCompaniesForUser(user.id)
}
