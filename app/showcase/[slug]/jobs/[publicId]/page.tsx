import { notFound } from "next/navigation"

import { PublicShowcaseJobPage } from "@/features/showcase/components/public-showcase-page"
import { getPublicShowcaseJob } from "@/features/showcase/server/queries"

export default async function ShowcaseJobPage({
  params,
}: Readonly<{
  params: Promise<{ publicId: string; slug: string }>
}>) {
  const { publicId, slug } = await params
  const data = await getPublicShowcaseJob(slug, publicId)

  if (!data) {
    notFound()
  }

  return <PublicShowcaseJobPage data={data} />
}
