import { requireCurrentUser } from "@/features/auth/server/auth"
import { ContactsPageQuery } from "@/features/contacts/components/contacts-page-query"
import { listContactsForUser } from "@/features/contacts/server/queries"

export default async function ContactsPage() {
  const user = await requireCurrentUser()
  const contacts = await listContactsForUser(user.id)

  return <ContactsPageQuery {...contacts} />
}
