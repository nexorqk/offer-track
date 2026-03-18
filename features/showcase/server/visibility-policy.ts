import "server-only"

export {
  canPublishNoteToShowcase,
  getNoteVisibilityValidationMessage,
  isPublicVisibilityProfile,
} from "@/features/showcase/lib/policy"

export function getPublicJobView(input: {
  appliedAt: Date | null
  companyName: string
  description?: string | null
  location: string | null
  publicId: string
  publicSummary: string | null
  source: string | null
  status: string
  title: string
  updatedAt: Date
  workMode: string | null
}) {
  return {
    appliedAt: input.appliedAt,
    companyName: input.companyName,
    description: input.description ?? null,
    location: input.location,
    publicId: input.publicId,
    publicSummary: input.publicSummary,
    source: input.source,
    status: input.status,
    title: input.title,
    updatedAt: input.updatedAt,
    workMode: input.workMode,
  }
}
