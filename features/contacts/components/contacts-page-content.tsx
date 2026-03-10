import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  Mail,
  type LucideIcon,
  MessagesSquare,
  Network,
  Users,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import type { ContactsPageData } from "@/features/contacts/server/queries"

type ContactsPageContentProps = ContactsPageData

export function ContactsPageContent({
  items,
  summary,
}: Readonly<ContactsPageContentProps>) {
  return (
    <div className="flex flex-col gap-5 pb-8">
      <section>
        <article className="overflow-hidden rounded-[2.25rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_20%,transparent))] p-5 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Relationship map
              </span>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    Keep recruiters, hiring managers, and interviewers connected to the work.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Scan every active relationship, jump into the linked company, and reopen the
                    exact job thread when the next reply needs context.
                  </p>
                </div>
                <Link
                  href="/jobs?view=kanban"
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <MessagesSquare data-icon="inline-start" />
                  Back to jobs
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCard
                icon={Users}
                label="Contacts"
                note="People currently tracked"
                value={String(summary.totalContacts)}
              />
              <SummaryCard
                icon={Building2}
                label="Companies"
                note="Organizations with known relationships"
                value={String(summary.companies)}
              />
              <SummaryCard
                icon={Network}
                label="Linked jobs"
                note="Contacts tied to a specific role"
                value={String(summary.linkedJobs)}
              />
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[2.25rem] border bg-background/92 shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Contact list
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold tracking-tight">All tracked contacts</h2>
              <p className="text-sm text-muted-foreground">
                {summary.totalContacts === 0
                  ? "Contacts will appear here as soon as you add people from a job detail page."
                  : `${summary.totalContacts} contacts across ${summary.companies} companies.`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4">
          {items.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
              No contacts tracked yet. Add recruiters or hiring managers from a job detail page.
            </div>
          ) : (
            items.map((contact) => (
              <article
                key={contact.id}
                className="rounded-[1.75rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_96%,transparent),color-mix(in_oklch,var(--color-muted)_16%,transparent))] p-5 shadow-[0_1px_0_color-mix(in_oklch,var(--color-foreground)_5%,transparent)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {contact.role ?? "Role not specified"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Pill>
                        <Link
                          href={`/companies#company-${contact.companyId}`}
                          className="underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {contact.companyName}
                        </Link>
                      </Pill>
                      {contact.jobId && contact.jobTitle ? (
                        <Pill>
                          <Link
                            href={`/jobs/${contact.jobId}`}
                            className="underline-offset-4 hover:text-foreground hover:underline"
                          >
                            {contact.jobTitle}
                          </Link>
                        </Pill>
                      ) : (
                        <Pill>Company-level relationship</Pill>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      {contact.email ? (
                        <span className="inline-flex items-center gap-2">
                          <Mail className="size-4" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="underline-offset-4 hover:text-foreground hover:underline"
                          >
                            {contact.email}
                          </a>
                        </span>
                      ) : null}
                      {contact.linkedinUrl ? (
                        <a
                          href={contact.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 underline-offset-4 hover:text-foreground hover:underline"
                        >
                          <ArrowUpRight className="size-4" />
                          LinkedIn
                        </a>
                      ) : null}
                    </div>

                    {contact.notes ? (
                      <p className="text-sm text-muted-foreground">{contact.notes}</p>
                    ) : null}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Updated {formatShortDate(contact.updatedAt)}
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

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(value)
}
