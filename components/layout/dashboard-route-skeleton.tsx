export function DashboardRouteSkeleton() {
  return (
    <div className="grid gap-5 pb-8">
      <section className="overflow-hidden rounded-[2.25rem] border bg-background/92 p-5 shadow-sm">
        <div className="grid gap-4">
          <SkeletonBar className="h-3 w-28" />
          <SkeletonBar className="h-10 w-full max-w-3xl" />
          <SkeletonBar className="h-5 w-full max-w-2xl" />
          <div className="grid gap-3 sm:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.25rem] border bg-background/92 p-5 shadow-sm">
        <div className="grid gap-4">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-8 w-72" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
          </div>
          <div className="grid gap-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </div>
      </section>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-[1.5rem] border bg-background/80 p-4">
      <div className="grid gap-4">
        <SkeletonBar className="h-4 w-28" />
        <SkeletonBar className="h-10 w-20" />
        <SkeletonBar className="h-4 w-full" />
      </div>
    </div>
  )
}

function SkeletonField() {
  return (
    <div className="grid gap-2">
      <SkeletonBar className="h-4 w-24" />
      <SkeletonBar className="h-11 w-full rounded-xl" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="rounded-[1.5rem] border bg-background/80 p-4">
      <div className="grid gap-3">
        <SkeletonBar className="h-5 w-52" />
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-40" />
      </div>
    </div>
  )
}

function SkeletonBar({ className }: Readonly<{ className: string }>) {
  return <div aria-hidden className={`animate-pulse rounded-full bg-muted/70 ${className}`} />
}
