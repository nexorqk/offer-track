import Link from "next/link"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CircleDotDashed,
  Layers2,
  type LucideIcon,
  Orbit,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import type { CompaniesPageData } from "@/features/companies/server/queries"

type CompaniesPageContentProps = CompaniesPageData

export function CompaniesPageContent({
  items,
  summary,
}: Readonly<CompaniesPageContentProps>) {
  return (
    <div className="flex flex-col gap-5 pb-8">
      <section>
        <article className="overflow-hidden rounded-[2.25rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_20%,transparent))] p-5 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Company map
              </span>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    See where each company sits before you dive back into the jobs.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Track how many roles are open at each company, spot the average pipeline
                    stage, and jump directly into the filtered jobs view when it is time to act.
                  </p>
                </div>
                <Link
                  href="/jobs?view=kanban"
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <BriefcaseBusiness data-icon="inline-start" />
                  Back to jobs
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCard
                icon={Building2}
                label="Companies"
                note="Tracked relationships in one place"
                value={String(summary.companies)}
              />
              <SummaryCard
                icon={Layers2}
                label="Total roles"
                note="Every role linked to a company"
                value={String(summary.totalJobs)}
              />
              <SummaryCard
                icon={Orbit}
                label="Open roles"
                note="Wishlist through final interview"
                value={String(summary.activeJobs)}
              />
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[2.25rem] border bg-background/92 shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Company list
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold tracking-tight">All tracked companies</h2>
              <p className="text-sm text-muted-foreground">
                {summary.companies === 0
                  ? "Companies will appear here as soon as saved jobs start linking them."
                  : `${summary.companies} companies connected to ${summary.totalJobs} tracked roles.`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4">
          {items.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
              No companies tracked yet. The first saved job will start building this list.
            </div>
          ) : (
            items.map((company) => (
              <article
                key={company.id}
                className="rounded-[1.75rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_96%,transparent),color-mix(in_oklch,var(--color-muted)_16%,transparent))] p-5 shadow-[0_1px_0_color-mix(in_oklch,var(--color-foreground)_5%,transparent)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {[company.location, company.industry].filter(Boolean).join(" · ") ||
                          "Company details will appear here as they are added."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Pill>{formatRoleCount(company.jobCount)}</Pill>
                      <Pill>{formatOpenRoleCount(company.openJobCount)}</Pill>
                      <Pill>
                        {company.averageStageLabel
                          ? `Average stage: ${company.averageStageLabel}`
                          : "Average stage: No jobs yet"}
                      </Pill>
                    </div>

                    {company.stageBreakdown.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {company.stageBreakdown.map((stage) => (
                          <span
                            key={`${company.id}-${stage.status}`}
                            className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {stage.label} · {stage.count}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full border border-dashed bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                        <CircleDotDashed className="size-3.5" />
                        No linked roles yet
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <Link
                      href={buildCompanyJobsHref(company.name)}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      <ArrowUpRight data-icon="inline-start" />
                      View jobs
                    </Link>
                    {company.website ? (
                      <Link
                        href={company.website}
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {company.website.replace(/^https?:\/\//, "")}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  note,
  value,
}: Readonly<{
  icon: LucideIcon
  label: string
  note: string
  value: string
}>) {
  return (
    <article className="rounded-[1.5rem] border bg-background/80 p-4 shadow-[0_1px_0_color-mix(in_oklch,var(--color-foreground)_5%,transparent)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{note}</p>
    </article>
  )
}

function Pill({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="rounded-full bg-muted/70 px-3 py-1 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
      {children}
    </span>
  )
}

function buildCompanyJobsHref(companyName: string) {
  return `/jobs?q=${encodeURIComponent(companyName)}`
}

function formatRoleCount(value: number) {
  return value === 1 ? "1 role" : `${value} roles`
}

function formatOpenRoleCount(value: number) {
  return value === 1 ? "1 open role" : `${value} open roles`
}
