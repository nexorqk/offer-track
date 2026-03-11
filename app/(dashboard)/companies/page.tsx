import { requireCurrentUser } from "@/features/auth/server/auth"
import { CompaniesPageQuery } from "@/features/companies/components/companies-page-query"
import { listCompaniesForUser } from "@/features/companies/server/queries"

export default async function CompaniesPage() {
  const user = await requireCurrentUser()
  const companies = await listCompaniesForUser(user.id)

  return <CompaniesPageQuery {...companies} />
}
