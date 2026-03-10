import { requireCurrentUser } from "@/features/auth/server/auth"
import { ContactsPageContent } from "@/features/contacts/components/contacts-page-content"
import { listContactsForUser } from "@/features/contacts/server/queries"

export default async function ContactsPage() {
  const user = await requireCurrentUser()
  const contacts = await listContactsForUser(user.id)

  return <ContactsPageContent {...contacts} />
}
