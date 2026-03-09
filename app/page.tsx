const stats = [
  { label: "Active applications", value: "12", note: "+3 this week" },
  { label: "Interviews booked", value: "4", note: "2 upcoming" },
  { label: "Response rate", value: "36%", note: "Above target" },
]

const pipeline = [
  {
    company: "Linear",
    role: "Product Designer",
    stage: "Interview loop",
    updatedAt: "Updated 2h ago",
  },
  {
    company: "Raycast",
    role: "Frontend Engineer",
    stage: "Take-home",
    updatedAt: "Due tomorrow",
  },
  {
    company: "Notion",
    role: "Growth Designer",
    stage: "Applied",
    updatedAt: "Waiting for response",
  },
]

const tasks = [
  "Review notes after tomorrow's interview",
  "Send follow-up to the hiring manager at Linear",
  "Prepare salary expectations for final round",
]

export default function Page() {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[1.75rem] border bg-background/90 p-5 shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <strong className="text-3xl font-semibold tracking-tight">
                {stat.value}
              </strong>
              <p className="text-sm text-muted-foreground">{stat.note}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <article className="rounded-[2rem] border bg-background/90 p-5 shadow-sm">
          <div className="flex flex-col gap-1 border-b pb-4">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Pipeline
            </span>
            <h3 className="text-xl font-semibold tracking-tight">
              Current opportunities
            </h3>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {pipeline.map((item) => (
              <article
                key={`${item.company}-${item.role}`}
                className="flex flex-col gap-3 rounded-[1.5rem] border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <strong className="text-base font-medium">{item.company}</strong>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
                <div className="flex flex-col gap-1 md:items-end">
                  <span className="text-sm font-medium">{item.stage}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.updatedAt}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-[2rem] border bg-background/90 p-5 shadow-sm">
            <div className="flex flex-col gap-1 border-b pb-4">
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Focus
              </span>
              <h3 className="text-xl font-semibold tracking-tight">
                This week&apos;s checklist
              </h3>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {tasks.map((task, index) => (
                <div
                  key={task}
                  className="flex items-start gap-3 rounded-[1.5rem] border bg-muted/30 p-4"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6">{task}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border bg-primary px-5 py-6 text-primary-foreground shadow-sm">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-primary-foreground/70">
                Ready next
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold tracking-tight">
                  Add filters, notes, and company detail pages.
                </h3>
                <p className="text-sm text-primary-foreground/80">
                  This shell is enough to start building the actual workflow.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div className="text-xs text-muted-foreground">
        Press <kbd>d</kbd> to toggle dark mode.
      </div>
    </div>
  )
}
