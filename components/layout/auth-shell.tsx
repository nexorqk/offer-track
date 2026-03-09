export function AuthShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden rounded-[2.5rem] border bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklch,_var(--color-primary)_18%,_transparent),_transparent_28%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_90%,transparent),color-mix(in_oklch,var(--color-muted)_45%,transparent))] p-8 shadow-sm lg:flex lg:flex-col lg:justify-between">
          <div className="flex max-w-md flex-col gap-4">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Offer Track
            </span>
            <div className="flex flex-col gap-3">
              <h2 className="text-4xl font-semibold tracking-tight">
                Keep every conversation, interview, and offer in one flow.
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Auth routes now live outside the dashboard shell, so account
                flows can evolve independently from the product workspace.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5">
            <p className="text-sm text-muted-foreground">
              Email/password auth is backed by Railway Postgres and Drizzle.
              Validation and server actions now live in <code>features/auth</code>.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border bg-background/90 p-6 shadow-sm sm:p-8">
          {children}
        </section>
      </div>
    </main>
  )
}
