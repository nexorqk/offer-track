"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { getDashboardRouteContext } from "./dashboard-navigation"

export function DashboardSectionHeader() {
  const pathname = usePathname()
  const { breadcrumbs, currentItem } = getDashboardRouteContext(pathname)

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-[color:var(--shell-panel-border)] bg-[color:var(--shell-panel-muted)] px-2.5 py-1 text-[0.64rem] font-medium tracking-[0.26em] text-muted-foreground uppercase">
          {currentItem.group}
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[0.72rem] text-muted-foreground">
          {breadcrumbs.map((breadcrumb, index) => (
            <div
              key={`${breadcrumb.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 ? <ChevronRight className="size-3" /> : null}
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className="rounded-full px-2 py-0.5 transition-colors hover:bg-[color:var(--shell-panel-muted)] hover:text-foreground"
                >
                  {breadcrumb.label}
                </Link>
              ) : (
                <span className="rounded-full bg-[color:var(--shell-panel-muted)] px-2 py-0.5 text-foreground">
                  {breadcrumb.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[clamp(1.9rem,2.8vw,2.75rem)] leading-none font-semibold text-foreground">
          {currentItem.title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {currentItem.description}
        </p>
      </div>
    </div>
  )
}
