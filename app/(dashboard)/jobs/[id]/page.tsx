import { notFound } from "next/navigation"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { JobDetailPageQuery } from "@/features/jobs/components/job-detail-page-query"
import {
  getJobDetailForUser,
  listCompanyNameOptions,
} from "@/features/jobs/server/queries"

type JobDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params
  const user = await requireCurrentUser()
  const [job, companyOptions] = await Promise.all([
    getJobDetailForUser(user.id, id),
    listCompanyNameOptions(user.id),
  ])

  if (!job) {
    notFound()
  }

  return <JobDetailPageQuery initialData={{ companyOptions, job }} jobId={id} />
}
