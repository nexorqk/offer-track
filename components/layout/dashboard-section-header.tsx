"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { getDashboardRouteContext } from "./dashboard-navigation"

export function DashboardSectionHeader() {
  const pathname = usePathname()
  const { breadcrumbs, currentItem } = getDashboardRouteContext(pathname)

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={`${breadcrumb.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight className="size-3" /> : null}
            {breadcrumb.href ? (
              <Link href={breadcrumb.href} className="hover:text-foreground">
                {breadcrumb.label}
              </Link>
            ) : (
              <span>{breadcrumb.label}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          {currentItem.title}
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {currentItem.description}
        </p>
      </div>
    </div>
  )
}
