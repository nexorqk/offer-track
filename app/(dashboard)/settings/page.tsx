import { requireCurrentUser } from "@/features/auth/server/auth"
import { ShowcaseSettingsForm } from "@/features/showcase/components/showcase-settings-form"
import { getShowcaseSettingsForUser } from "@/features/showcase/server/queries"

export default async function SettingsPage() {
  const user = await requireCurrentUser()
  const showcaseSettings = await getShowcaseSettingsForUser(user.id)

  return <ShowcaseSettingsForm initialValues={showcaseSettings} />
}
