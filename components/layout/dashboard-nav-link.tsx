"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Clock3,
  NotebookText,
  Settings,
  UserRoundSearch,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { DashboardNavIcon } from "@/components/layout/dashboard-navigation"

const iconMap = {
  analytics: BarChart3,
  companies: Building2,
  contacts: UserRoundSearch,
  dashboard: BarChart3,
  jobs: BriefcaseBusiness,
  notes: NotebookText,
  settings: Settings,
  tasks: Clock3,
} as const

type DashboardNavLinkProps = {
  collapsed?: boolean
  description?: string
  href: string
  label: string
  icon?: DashboardNavIcon
  mobile?: boolean
}

const desktopNavLinkClass =
  "group/nav relative inline-flex min-h-[4rem] items-start justify-start gap-3 rounded-[1.45rem] border px-3.5 py-3 text-left text-sm transition-all duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const desktopNavLinkActiveClass =
  "border-[color:var(--shell-active-border)] bg-[color:var(--shell-active)] text-[color:var(--shell-active-foreground)] shadow-[0_18px_40px_-28px_var(--shell-shadow-strong)]"

const desktopNavLinkIdleClass =
  "border-transparent text-[color:var(--shell-rail-foreground)] hover:border-white/8 hover:bg-white/7"

const mobileNavLinkClass =
  "group/nav inline-flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-[1.4rem] border px-2.5 py-2.5 text-[0.72rem] font-medium transition-all duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const mobileNavLinkActiveClass =
  "border-[color:var(--shell-active-border)] bg-[color:var(--shell-panel)] text-foreground shadow-[0_18px_36px_-30px_var(--shell-shadow)]"

const mobileNavLinkIdleClass =
  "border-transparent text-muted-foreground hover:border-[color:var(--shell-panel-border)] hover:bg-[color:var(--shell-panel-muted)] hover:text-foreground"

const desktopNavIconClass =
  "flex size-10 shrink-0 items-center justify-center rounded-[1rem] border transition-all duration-200"

const desktopNavIconActiveClass =
  "border-white/12 bg-white/12 text-[color:var(--shell-active-foreground)]"

const desktopNavIconIdleClass =
  "border-white/8 bg-black/8 text-[color:var(--shell-rail-muted)] group-hover/nav:text-[color:var(--shell-rail-foreground)]"

const mobileNavIconClass =
  "flex size-9 items-center justify-center rounded-[1rem] border transition-all duration-200"

const mobileNavIconActiveClass =
  "border-[color:var(--shell-active-border)] bg-[color:var(--shell-active)] text-foreground"

const mobileNavIconIdleClass =
  "border-transparent bg-background/60 text-muted-foreground group-hover/nav:bg-background group-hover/nav:text-foreground"

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardNavLink({
  collapsed = false,
  description,
  href,
  label,
  icon,
  mobile = false,
}: DashboardNavLinkProps) {
  const pathname = usePathname()
  const active = isActivePath(pathname, href)
  const Icon = icon ? iconMap[icon] : null

  if (mobile) {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          mobileNavLinkClass,
          active ? mobileNavLinkActiveClass : mobileNavLinkIdleClass
        )}
      >
        {Icon ? (
          <span
            className={cn(
              mobileNavIconClass,
              active ? mobileNavIconActiveClass : mobileNavIconIdleClass
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        desktopNavLinkClass,
        collapsed ? "min-h-0 justify-center px-0 py-2.5" : "w-full",
        active ? desktopNavLinkActiveClass : desktopNavLinkIdleClass
      )}
      title={collapsed ? (description ?? label) : undefined}
    >
      {Icon ? (
        <span
          className={cn(
            desktopNavIconClass,
            active ? desktopNavIconActiveClass : desktopNavIconIdleClass,
            collapsed && "size-11"
          )}
        >
          <Icon className="size-4.5" />
        </span>
      ) : null}
      {collapsed ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm leading-5 font-semibold">
            {label}
          </span>
          {description ? (
            <span
              className={cn(
                "mt-1 block text-[0.72rem] leading-5",
                active
                  ? "text-[color:var(--shell-active-foreground)] opacity-75"
                  : "text-[color:var(--shell-rail-muted)]"
              )}
            >
              {description}
            </span>
          ) : null}
        </span>
      )}
    </Link>
  )
}
