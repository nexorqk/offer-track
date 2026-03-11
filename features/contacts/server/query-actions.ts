"use server"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { listContactsForUser } from "@/features/contacts/server/queries"

export async function getContactsPageDataAction() {
  const user = await requireCurrentUser()

  return listContactsForUser(user.id)
}
