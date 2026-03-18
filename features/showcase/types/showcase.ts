import type {
  NoteKindOption,
  VisibilityProfileOption,
} from "@/features/showcase/lib/visibility"

export type ShowcaseSettingsValues = {
  showcaseBio: string
  showcaseEnabled: boolean
  showcaseIntro: string
  showcaseSlug: string
  showcaseTitle: string
}

export type ShowcaseSettingsFieldName =
  | "showcaseBio"
  | "showcaseEnabled"
  | "showcaseIntro"
  | "showcaseSlug"
  | "showcaseTitle"

export type ShowcaseSettingsState = {
  fieldErrors?: Partial<Record<ShowcaseSettingsFieldName, string[]>>
  message?: string
  status: "error" | "idle" | "success"
}

export const initialShowcaseSettingsState: ShowcaseSettingsState = {
  status: "idle",
}

export type PublicShowcaseJobCard = {
  appliedAt: Date | null
  companyName: string
  location: string | null
  publicId: string
  publicSummary: string | null
  source: string | null
  status: string
  title: string
  updatedAt: Date
  workMode: string | null
}

export type PublicShowcaseReflection = {
  content: string
  createdAt: Date
  id: string
  job: Pick<PublicShowcaseJobCard, "companyName" | "publicId" | "title">
  noteKind: Extract<NoteKindOption, "reflection" | "update">
  updatedAt: Date
  visibilityProfile: VisibilityProfileOption
}

export type PublicShowcaseMetrics = {
  activeApplications: number
  offers: number
  reflections: number
  totalPublicJobs: number
}

export type PublicShowcasePageData = {
  metrics: PublicShowcaseMetrics
  profile: {
    bio: string | null
    intro: string | null
    slug: string
    title: string | null
  }
  reflections: PublicShowcaseReflection[]
  selectedJobs: PublicShowcaseJobCard[]
}

export type PublicShowcaseJobPageData = {
  job: PublicShowcaseJobCard
  profile: PublicShowcasePageData["profile"]
  reflections: PublicShowcaseReflection[]
}
