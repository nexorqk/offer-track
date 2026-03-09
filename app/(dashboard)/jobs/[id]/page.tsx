import { RoutePlaceholder } from "@/components/layout/route-placeholder"

type JobDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params

  return (
    <RoutePlaceholder
      eyebrow="Job Detail"
      title={`Job ${id}`}
      description="Use this route for notes, interview timeline, compensation details, and linked contacts."
    />
  )
}
