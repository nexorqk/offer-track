import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import { requireCurrentUser } from "@/features/auth/server/auth"
import { JobForm } from "@/features/jobs/components/job-form"
import { createJobAction } from "@/features/jobs/server/actions"
import { listCompanyNameOptions } from "@/features/jobs/server/queries"
import { emptyJobFormValues } from "@/features/jobs/types/job"

export default async function NewJobPage() {
  const user = await requireCurrentUser()
  const companyOptions = await listCompanyNameOptions(user.id)

  return (
    <div className="grid gap-5 pb-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.65fr)]">
      <article className="rounded-[2.25rem] border bg-background/92 p-5 shadow-sm">
        <JobForm
          action={createJobAction}
          companyOptions={companyOptions}
          description="Capture a new opportunity in a focused flow, then drop back into list or kanban to work the pipeline."
          initialValues={emptyJobFormValues}
          submitLabel="Create job"
          title="Add a role"
        />
      </article>

      <aside className="grid gap-5 self-start">
        <article className="rounded-[2rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_22%,transparent))] p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Focused flow
              </span>
              <h1 className="text-xl font-semibold tracking-tight">Create job</h1>
            </div>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Sparkles className="size-4" />
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
            <p>
              Keep creation separate from pipeline management so search, filters, and kanban stay clean.
            </p>
            <p>
              After saving, you will land on the job details page where contacts, notes, and tasks already live.
            </p>
          </div>
        </article>

        <Link href="/jobs" className={buttonVariants({ size: "lg", variant: "outline" })}>
          <ArrowLeft data-icon="inline-start" />
          Back to jobs
        </Link>
      </aside>
    </div>
  )
}
