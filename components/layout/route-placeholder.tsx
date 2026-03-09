import Link from "next/link"

type RoutePlaceholderProps = {
  eyebrow: string
  title: string
  description: string
}

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
}: RoutePlaceholderProps) {
  return (
    <section className="grid gap-4 pb-8 xl:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-[2rem] border bg-background/90 p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-[2rem] border bg-muted/30 p-6 shadow-sm">
        <div className="flex h-full flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Scaffolded and ready
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Keep route-only UI close to this page, and move reusable business
              logic into the matching feature module.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Back to dashboard
          </Link>
        </div>
      </article>
    </section>
  )
}
