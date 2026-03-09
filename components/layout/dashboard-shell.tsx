import {
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import { DashboardNavLink } from "./dashboard-nav-link"

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/jobs", label: "Jobs", icon: "jobs" },
  { href: "/companies", label: "Companies", icon: "companies" },
  { href: "/contacts", label: "Contacts", icon: "contacts" },
  { href: "/tasks", label: "Tasks", icon: "tasks" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="mx-auto flex min-h-svh max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <aside className="hidden w-72 shrink-0 flex-col justify-between rounded-[2rem] border bg-background/90 p-4 shadow-sm backdrop-blur lg:flex">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 rounded-[1.5rem] border bg-muted/40 p-4">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Offer Track
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold tracking-tight">
                Job search, without the spreadsheet mess
              </h1>
              <p className="text-sm text-muted-foreground">
                Keep your pipeline, interviews, contacts, and offers in one
                focused workspace.
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <DashboardNavLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 rounded-[1.5rem] border bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">This week</span>
            <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
              3 interviews
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Follow up on active applications and keep notes close to the
            timeline.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="flex flex-col gap-3 rounded-[2rem] border bg-background/90 px-4 py-4 shadow-sm backdrop-blur sm:px-5 lg:sticky lg:top-4 lg:z-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Candidate cockpit
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Structured for App Router growth
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Dashboard routes, auth routes, shared layout primitives, and
                feature modules now have clear boundaries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Search data-icon="inline-start" />
              Search
            </Button>
            <Button size="sm">Add offer</Button>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto rounded-[1.75rem] border bg-background/80 p-2 lg:hidden">
          {navigation.map(({ href, label }) => (
            <DashboardNavLink key={href} href={href} label={label} mobile />
          ))}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
