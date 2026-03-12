import { scrypt } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 64
const DEMO_PASSWORD_SALT = "offer-track-demo-salt"

export const DEMO_SEED_EMAIL = "demo@offertrack.app"
export const DEMO_SEED_PASSWORD = "DemoPass123!"
export const DEMO_SEED_USER_ID = "5f5d6af8-88ac-4e65-b3cc-d6b0d5331001"

type JobStatus =
  | "wishlist"
  | "applied"
  | "hr_screen"
  | "technical"
  | "final"
  | "offer"
  | "rejected"

type WorkMode = "remote" | "hybrid" | "onsite"
type InterviewType = "hr" | "technical" | "final"

export type SeedPlan = {
  account: {
    email: string
    fullName: string
    password: string
  }
  users: Array<{
    id: string
    email: string
    passwordHash: string
    createdAt: Date
    updatedAt: Date
  }>
  profiles: Array<{
    id: string
    email: string
    fullName: string
    avatarUrl: string
    createdAt: Date
  }>
  companies: Array<{
    id: string
    userId: string
    name: string
    nameKey: string
    website: string
    location: string
    industry: string
    notes: string
    createdAt: Date
    updatedAt: Date
  }>
  jobs: Array<{
    id: string
    userId: string
    companyId: string
    title: string
    source: string
    sourceUrl: string
    location: string
    employmentType: string
    workMode: WorkMode
    salaryMin: number
    salaryMax: number
    currency: string
    status: JobStatus
    priority: string
    appliedAt: Date | null
    description: string
    createdAt: Date
    updatedAt: Date
  }>
  jobStageHistory: Array<{
    id: string
    jobId: string
    fromStatus: JobStatus | null
    toStatus: JobStatus
    changedAt: Date
  }>
  contacts: Array<{
    id: string
    userId: string
    companyId: string
    jobId: string | null
    name: string
    role: string
    email: string
    linkedinUrl: string
    notes: string
    createdAt: Date
    updatedAt: Date
  }>
  notes: Array<{
    id: string
    userId: string
    jobId: string
    content: string
    createdAt: Date
    updatedAt: Date
  }>
  interviews: Array<{
    id: string
    jobId: string
    type: InterviewType
    scheduledAt: Date
    durationMinutes: number
    location: string
    result: string
    notes: string
    createdAt: Date
    updatedAt: Date
  }>
  tasks: Array<{
    id: string
    userId: string
    jobId: string
    title: string
    dueDate: Date | null
    completed: boolean
    createdAt: Date
    updatedAt: Date
  }>
}

function date(value: string) {
  return new Date(value)
}

async function buildSeedPasswordHash(password: string) {
  const derivedKey = (await scryptAsync(
    password,
    DEMO_PASSWORD_SALT,
    KEY_LENGTH,
  )) as Buffer

  return `scrypt$${DEMO_PASSWORD_SALT}$${derivedKey.toString("hex")}`
}

export async function buildSeedPlan(): Promise<SeedPlan> {
  const passwordHash = await buildSeedPasswordHash(DEMO_SEED_PASSWORD)

  const ids = {
    companyAtlas: "f55df8aa-b4ff-451c-9429-e6ea783b2001",
    companyNorthstar: "f55df8aa-b4ff-451c-9429-e6ea783b2002",
    companySignal: "f55df8aa-b4ff-451c-9429-e6ea783b2003",
    jobAtlasFrontend: "9cdbfe15-608a-46df-83e4-0361a4b13001",
    jobNorthstarPlatform: "9cdbfe15-608a-46df-83e4-0361a4b13002",
    jobSignalLead: "9cdbfe15-608a-46df-83e4-0361a4b13003",
    jobWishlist: "9cdbfe15-608a-46df-83e4-0361a4b13004",
  }

  return {
    account: {
      email: DEMO_SEED_EMAIL,
      fullName: "Demo Candidate",
      password: DEMO_SEED_PASSWORD,
    },
    users: [
      {
        id: DEMO_SEED_USER_ID,
        email: DEMO_SEED_EMAIL,
        passwordHash,
        createdAt: date("2026-02-01T09:00:00.000Z"),
        updatedAt: date("2026-03-09T09:00:00.000Z"),
      },
    ],
    profiles: [
      {
        id: DEMO_SEED_USER_ID,
        email: DEMO_SEED_EMAIL,
        fullName: "Demo Candidate",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
        createdAt: date("2026-02-01T09:00:00.000Z"),
      },
    ],
    companies: [
      {
        id: ids.companyAtlas,
        userId: DEMO_SEED_USER_ID,
        name: "Atlas Labs",
        nameKey: "atlas labs",
        website: "https://atlaslabs.dev",
        location: "Berlin, Germany",
        industry: "Developer tooling",
        notes: "Strong frontend culture and a compact product team.",
        createdAt: date("2026-02-02T10:00:00.000Z"),
        updatedAt: date("2026-03-01T08:30:00.000Z"),
      },
      {
        id: ids.companyNorthstar,
        userId: DEMO_SEED_USER_ID,
        name: "Northstar Health",
        nameKey: "northstar health",
        website: "https://northstar.health",
        location: "Warsaw, Poland",
        industry: "Healthtech",
        notes: "Platform engineering opening with a hybrid schedule.",
        createdAt: date("2026-02-04T11:30:00.000Z"),
        updatedAt: date("2026-03-04T07:45:00.000Z"),
      },
      {
        id: ids.companySignal,
        userId: DEMO_SEED_USER_ID,
        name: "Signal Forge",
        nameKey: "signal forge",
        website: "https://signalforge.com",
        location: "Remote, EU",
        industry: "B2B SaaS",
        notes: "Fast interview loop and a strong offer package.",
        createdAt: date("2026-02-10T14:15:00.000Z"),
        updatedAt: date("2026-03-08T16:10:00.000Z"),
      },
    ],
    jobs: [
      {
        id: ids.jobAtlasFrontend,
        userId: DEMO_SEED_USER_ID,
        companyId: ids.companyAtlas,
        title: "Frontend Engineer",
        source: "LinkedIn",
        sourceUrl: "https://linkedin.com/jobs/view/atlas-frontend",
        location: "Remote, EU",
        employmentType: "full-time",
        workMode: "remote",
        salaryMin: 4500,
        salaryMax: 5500,
        currency: "EUR",
        status: "applied",
        priority: "high",
        appliedAt: date("2026-02-12T08:15:00.000Z"),
        description: "Build candidate-facing workflows in Next.js and TypeScript.",
        createdAt: date("2026-02-10T09:15:00.000Z"),
        updatedAt: date("2026-02-12T08:15:00.000Z"),
      },
      {
        id: ids.jobNorthstarPlatform,
        userId: DEMO_SEED_USER_ID,
        companyId: ids.companyNorthstar,
        title: "Platform Engineer",
        source: "Company site",
        sourceUrl: "https://northstar.health/careers/platform-engineer",
        location: "Warsaw, Poland",
        employmentType: "full-time",
        workMode: "hybrid",
        salaryMin: 6000,
        salaryMax: 7200,
        currency: "USD",
        status: "technical",
        priority: "medium",
        appliedAt: date("2026-02-18T12:00:00.000Z"),
        description: "Own internal developer tooling and observability workflows.",
        createdAt: date("2026-02-15T10:00:00.000Z"),
        updatedAt: date("2026-03-03T15:30:00.000Z"),
      },
      {
        id: ids.jobSignalLead,
        userId: DEMO_SEED_USER_ID,
        companyId: ids.companySignal,
        title: "Senior Frontend Lead",
        source: "Referral",
        sourceUrl: "https://signalforge.com/jobs/frontend-lead",
        location: "Remote, EU",
        employmentType: "full-time",
        workMode: "remote",
        salaryMin: 7000,
        salaryMax: 8500,
        currency: "USD",
        status: "offer",
        priority: "high",
        appliedAt: date("2026-02-20T09:20:00.000Z"),
        description: "Lead the frontend architecture for analytics-heavy SaaS flows.",
        createdAt: date("2026-02-19T16:45:00.000Z"),
        updatedAt: date("2026-03-08T16:10:00.000Z"),
      },
      {
        id: ids.jobWishlist,
        userId: DEMO_SEED_USER_ID,
        companyId: ids.companyAtlas,
        title: "Design Engineer",
        source: "Hacker News",
        sourceUrl: "https://jobs.example.com/atlas-design-engineer",
        location: "Amsterdam, Netherlands",
        employmentType: "full-time",
        workMode: "onsite",
        salaryMin: 4800,
        salaryMax: 5800,
        currency: "EUR",
        status: "wishlist",
        priority: "low",
        appliedAt: null,
        description: "Explore a possible pivot into design systems and motion-heavy UI.",
        createdAt: date("2026-03-05T12:10:00.000Z"),
        updatedAt: date("2026-03-05T12:10:00.000Z"),
      },
    ],
    jobStageHistory: [
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7001",
        jobId: ids.jobAtlasFrontend,
        fromStatus: null,
        toStatus: "wishlist",
        changedAt: date("2026-02-10T09:15:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7002",
        jobId: ids.jobAtlasFrontend,
        fromStatus: "wishlist",
        toStatus: "applied",
        changedAt: date("2026-02-12T08:15:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7003",
        jobId: ids.jobNorthstarPlatform,
        fromStatus: null,
        toStatus: "wishlist",
        changedAt: date("2026-02-15T10:00:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7004",
        jobId: ids.jobNorthstarPlatform,
        fromStatus: "wishlist",
        toStatus: "applied",
        changedAt: date("2026-02-18T12:00:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7005",
        jobId: ids.jobNorthstarPlatform,
        fromStatus: "applied",
        toStatus: "hr_screen",
        changedAt: date("2026-02-24T16:30:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7006",
        jobId: ids.jobNorthstarPlatform,
        fromStatus: "hr_screen",
        toStatus: "technical",
        changedAt: date("2026-03-03T15:30:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7007",
        jobId: ids.jobSignalLead,
        fromStatus: null,
        toStatus: "wishlist",
        changedAt: date("2026-02-19T16:45:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7008",
        jobId: ids.jobSignalLead,
        fromStatus: "wishlist",
        toStatus: "applied",
        changedAt: date("2026-02-20T09:20:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7009",
        jobId: ids.jobSignalLead,
        fromStatus: "applied",
        toStatus: "hr_screen",
        changedAt: date("2026-02-25T11:00:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7010",
        jobId: ids.jobSignalLead,
        fromStatus: "hr_screen",
        toStatus: "technical",
        changedAt: date("2026-03-01T13:00:00.000Z"),
      },
      {
        id: "2788df53-30ab-4cc2-b6cb-a4ff1a5a7011",
        jobId: ids.jobSignalLead,
        fromStatus: "technical",
        toStatus: "offer",
        changedAt: date("2026-03-08T16:10:00.000Z"),
      },
    ],
    contacts: [
      {
        id: "54f6c0cc-3f10-4478-accf-0b6094558001",
        userId: DEMO_SEED_USER_ID,
        companyId: ids.companyAtlas,
        jobId: ids.jobAtlasFrontend,
        name: "Marta Schulz",
        role: "Engineering Manager",
        email: "marta@atlaslabs.dev",
        linkedinUrl: "https://linkedin.com/in/marta-schulz",
        notes: "Asked for portfolio links and recent UI architecture examples.",
        createdAt: date("2026-02-11T10:20:00.000Z"),
        updatedAt: date("2026-02-12T08:30:00.000Z"),
      },
      {
        id: "54f6c0cc-3f10-4478-accf-0b6094558002",
        userId: DEMO_SEED_USER_ID,
        companyId: ids.companyNorthstar,
        jobId: ids.jobNorthstarPlatform,
        name: "Piotr Zielinski",
        role: "Talent Partner",
        email: "piotr@northstar.health",
        linkedinUrl: "https://linkedin.com/in/piotr-zielinski",
        notes: "Shared prep notes for the system design interview.",
        createdAt: date("2026-02-18T12:10:00.000Z"),
        updatedAt: date("2026-03-03T15:35:00.000Z"),
      },
      {
        id: "54f6c0cc-3f10-4478-accf-0b6094558003",
        userId: DEMO_SEED_USER_ID,
        companyId: ids.companySignal,
        jobId: ids.jobSignalLead,
        name: "Elena Petrova",
        role: "VP Product",
        email: "elena@signalforge.com",
        linkedinUrl: "https://linkedin.com/in/elena-petrova",
        notes: "Final-round interviewer and future cross-functional stakeholder.",
        createdAt: date("2026-02-24T09:45:00.000Z"),
        updatedAt: date("2026-03-08T16:12:00.000Z"),
      },
      {
        id: "54f6c0cc-3f10-4478-accf-0b6094558004",
        userId: DEMO_SEED_USER_ID,
        companyId: ids.companyAtlas,
        jobId: null,
        name: "Nina Rossi",
        role: "Recruiter",
        email: "nina@atlaslabs.dev",
        linkedinUrl: "https://linkedin.com/in/nina-rossi",
        notes: "Shared a second role that is still in wishlist state.",
        createdAt: date("2026-03-05T12:30:00.000Z"),
        updatedAt: date("2026-03-05T12:30:00.000Z"),
      },
    ],
    notes: [
      {
        id: "f1796533-c71f-4f79-b204-7592b8399001",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobAtlasFrontend,
        content: "Tailor the resume around collaboration with product designers.",
        createdAt: date("2026-02-10T09:30:00.000Z"),
        updatedAt: date("2026-02-10T09:30:00.000Z"),
      },
      {
        id: "f1796533-c71f-4f79-b204-7592b8399002",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobNorthstarPlatform,
        content: "Need a concise story about CI/CD ownership and internal tooling ROI.",
        createdAt: date("2026-02-24T18:00:00.000Z"),
        updatedAt: date("2026-02-24T18:00:00.000Z"),
      },
      {
        id: "f1796533-c71f-4f79-b204-7592b8399003",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobNorthstarPlatform,
        content: "Architecture interview focuses on observability and incident response.",
        createdAt: date("2026-03-02T08:45:00.000Z"),
        updatedAt: date("2026-03-02T08:45:00.000Z"),
      },
      {
        id: "f1796533-c71f-4f79-b204-7592b8399004",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobSignalLead,
        content: "Offer conversation opened with equity upside and a 30-day start window.",
        createdAt: date("2026-03-08T16:15:00.000Z"),
        updatedAt: date("2026-03-08T16:15:00.000Z"),
      },
      {
        id: "f1796533-c71f-4f79-b204-7592b8399005",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobWishlist,
        content: "Keep this as a design-systems backup if lead roles stall out.",
        createdAt: date("2026-03-05T12:20:00.000Z"),
        updatedAt: date("2026-03-05T12:20:00.000Z"),
      },
    ],
    interviews: [
      {
        id: "8b1c1aa7-9019-4974-bd78-40d7da95a001",
        jobId: ids.jobNorthstarPlatform,
        type: "technical",
        scheduledAt: date("2026-03-12T13:00:00.000Z"),
        durationMinutes: 90,
        location: "Google Meet",
        result: "scheduled",
        notes: "System design with platform and SRE leads.",
        createdAt: date("2026-03-03T15:35:00.000Z"),
        updatedAt: date("2026-03-03T15:35:00.000Z"),
      },
      {
        id: "8b1c1aa7-9019-4974-bd78-40d7da95a002",
        jobId: ids.jobSignalLead,
        type: "hr",
        scheduledAt: date("2026-02-25T11:00:00.000Z"),
        durationMinutes: 45,
        location: "Zoom",
        result: "passed",
        notes: "Comp discussion and team-shape overview.",
        createdAt: date("2026-02-24T09:45:00.000Z"),
        updatedAt: date("2026-02-25T11:50:00.000Z"),
      },
      {
        id: "8b1c1aa7-9019-4974-bd78-40d7da95a003",
        jobId: ids.jobSignalLead,
        type: "final",
        scheduledAt: date("2026-03-06T14:00:00.000Z"),
        durationMinutes: 120,
        location: "Signal Forge HQ",
        result: "passed",
        notes: "Panel interview finished with verbal positive feedback.",
        createdAt: date("2026-03-01T13:05:00.000Z"),
        updatedAt: date("2026-03-06T16:20:00.000Z"),
      },
    ],
    tasks: [
      {
        id: "75fb96ac-91cc-4b08-b685-4d5afaa3a001",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobAtlasFrontend,
        title: "Send follow-up note to Marta after application review window",
        dueDate: date("2026-03-10T09:00:00.000Z"),
        completed: false,
        createdAt: date("2026-03-08T09:00:00.000Z"),
        updatedAt: date("2026-03-08T09:00:00.000Z"),
      },
      {
        id: "75fb96ac-91cc-4b08-b685-4d5afaa3a002",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobNorthstarPlatform,
        title: "Prepare system design examples for the technical interview",
        dueDate: date("2026-03-11T18:00:00.000Z"),
        completed: false,
        createdAt: date("2026-03-03T15:40:00.000Z"),
        updatedAt: date("2026-03-03T15:40:00.000Z"),
      },
      {
        id: "75fb96ac-91cc-4b08-b685-4d5afaa3a003",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobSignalLead,
        title: "Review the offer package and draft negotiation points",
        dueDate: date("2026-03-10T13:00:00.000Z"),
        completed: false,
        createdAt: date("2026-03-08T16:20:00.000Z"),
        updatedAt: date("2026-03-08T16:20:00.000Z"),
      },
      {
        id: "75fb96ac-91cc-4b08-b685-4d5afaa3a004",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobSignalLead,
        title: "Confirm references are ready if Signal Forge asks for them",
        dueDate: null,
        completed: true,
        createdAt: date("2026-03-02T10:10:00.000Z"),
        updatedAt: date("2026-03-04T12:15:00.000Z"),
      },
      {
        id: "75fb96ac-91cc-4b08-b685-4d5afaa3a005",
        userId: DEMO_SEED_USER_ID,
        jobId: ids.jobWishlist,
        title: "Decide whether the design engineer track is worth an application",
        dueDate: date("2026-03-14T12:00:00.000Z"),
        completed: false,
        createdAt: date("2026-03-05T12:25:00.000Z"),
        updatedAt: date("2026-03-05T12:25:00.000Z"),
      },
    ],
  }
}
