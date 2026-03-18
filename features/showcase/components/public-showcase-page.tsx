import Link from "next/link"

import type {
  PublicShowcaseJobPageData,
  PublicShowcasePageData,
} from "@/features/showcase/types/showcase"

export function PublicShowcasePage({
  data,
}: Readonly<{
  data: PublicShowcasePageData
}>) {
  const title = data.profile.title || `${data.profile.slug} showcase`

  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#faf7f1,#f3efe8)] text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,243,235,0.94))] p-6 shadow-[0_30px_90px_-48px_rgba(76,57,32,0.32)] lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="grid gap-4">
              <span className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-slate-500">
                Offer Track Showcase
              </span>
              <div className="grid gap-2">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h1>
                {data.profile.intro ? (
                  <p className="max-w-3xl text-base leading-7 text-slate-600">
                    {data.profile.intro}
                  </p>
                ) : null}
              </div>
              {data.profile.bio ? (
                <p className="max-w-2xl text-sm leading-6 text-slate-500">
                  {data.profile.bio}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 rounded-[2rem] border border-black/5 bg-white/70 p-4">
              <MetricCard
                label="Public jobs"
                value={String(data.metrics.totalPublicJobs)}
              />
              <MetricCard
                label="Active applications"
                value={String(data.metrics.activeApplications)}
              />
              <MetricCard label="Offers" value={String(data.metrics.offers)} />
              <MetricCard
                label="Reflections"
                value={String(data.metrics.reflections)}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] border border-black/5 bg-white/82 p-6 shadow-sm">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-slate-500">
                  Selected roles
                </span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Public job pipeline
                </h2>
              </div>
            </div>

            <div className="grid gap-4">
              {data.selectedJobs.length === 0 ? (
                <EmptyBlock text="No public jobs yet." />
              ) : (
                data.selectedJobs.map((job) => (
                  <Link
                    key={job.publicId}
                    href={`/showcase/${data.profile.slug}/jobs/${job.publicId}`}
                    className="grid gap-3 rounded-[1.6rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,246,242,0.94))] p-4 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-black/8 bg-white/80 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                        {formatStatusLabel(job.status)}
                      </span>
                      {job.workMode ? (
                        <span className="rounded-full border border-black/8 bg-white/80 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                          {job.workMode}
                        </span>
                      ) : null}
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-lg font-semibold text-slate-950">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {job.companyName}
                        {job.location ? ` • ${job.location}` : ""}
                      </p>
                    </div>
                    {job.publicSummary ? (
                      <p className="text-sm leading-6 text-slate-600">
                        {job.publicSummary}
                      </p>
                    ) : null}
                  </Link>
                ))
              )}
            </div>
          </article>

          <article className="rounded-[2rem] border border-black/5 bg-white/82 p-6 shadow-sm">
            <div className="mb-5">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-slate-500">
                Reflections
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Search journal
              </h2>
            </div>

            <div className="grid gap-4">
              {data.reflections.length === 0 ? (
                <EmptyBlock text="No public reflections yet." />
              ) : (
                data.reflections.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-[1.6rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,246,240,0.92))] p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-black/8 bg-white/80 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                        {note.noteKind}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(note.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {note.job.title} at {note.job.companyName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}

export function PublicShowcaseJobPage({
  data,
}: Readonly<{
  data: PublicShowcaseJobPageData
}>) {
  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#faf7f1,#f3efe8)] text-slate-900">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/showcase/${data.profile.slug}`}
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
          >
            Back to showcase
          </Link>
          <span className="rounded-full border border-black/8 bg-white/80 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
            {formatStatusLabel(data.job.status)}
          </span>
        </div>

        <article className="rounded-[2.5rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,242,235,0.94))] p-6 shadow-[0_30px_90px_-48px_rgba(76,57,32,0.32)] lg:p-8">
          <div className="grid gap-3">
            <p className="text-sm text-slate-500">{data.job.companyName}</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              {data.job.title}
            </h1>
            <p className="text-sm text-slate-500">
              {[data.job.location, data.job.workMode, data.job.source]
                .filter(Boolean)
                .join(" • ")}
            </p>
          </div>

          {data.job.publicSummary ? (
            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-700">
              {data.job.publicSummary}
            </p>
          ) : null}

        </article>

        <article className="rounded-[2rem] border border-black/5 bg-white/82 p-6 shadow-sm">
          <div className="mb-5">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-slate-500">
              Related reflections
            </span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Notes from the search
            </h2>
          </div>

          <div className="grid gap-4">
            {data.reflections.length === 0 ? (
              <EmptyBlock text="No public reflections for this role yet." />
            ) : (
              data.reflections.map((note) => (
                <div
                  key={note.id}
                  className="rounded-[1.6rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,246,240,0.92))] p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-black/8 bg-white/80 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                      {note.noteKind}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDateTime(note.updatedAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
}: Readonly<{
  label: string
  value: string
}>) {
  return (
    <div className="rounded-[1.5rem] border border-black/5 bg-white/80 px-4 py-4">
      <div className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function EmptyBlock({
  text,
}: Readonly<{
  text: string
}>) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-black/10 bg-white/60 px-4 py-6 text-sm text-slate-500">
      {text}
    </div>
  )
}

function formatStatusLabel(value: string) {
  return value
    .split("_")
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ")
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(value)
}
