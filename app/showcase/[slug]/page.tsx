import { notFound } from "next/navigation"

import { PublicShowcasePage } from "@/features/showcase/components/public-showcase-page"
import { getPublicShowcaseBySlug } from "@/features/showcase/server/queries"

export default async function ShowcasePage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>
}>) {
  const { slug } = await params
  const data = await getPublicShowcaseBySlug(slug)

  if (!data) {
    notFound()
  }

  return <PublicShowcasePage data={data} />
}
