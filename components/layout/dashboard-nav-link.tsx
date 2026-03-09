"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Clock3,
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
  "inline-flex min-h-11 items-center justify-start gap-2 rounded-[1.15rem] px-3 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const desktopNavLinkActiveClass =
  "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80"

const desktopNavLinkIdleClass = "hover:bg-muted hover:text-foreground"

const mobileNavLinkClass =
  "inline-flex min-h-18 flex-col items-center justify-center gap-1 rounded-[1.35rem] px-2 py-2 text-[0.72rem] font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const mobileNavLinkActiveClass =
  "border bg-background text-foreground shadow-sm"

const mobileNavLinkIdleClass =
  "border border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"

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

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        mobile ? mobileNavLinkClass : desktopNavLinkClass,
        !mobile && collapsed && "justify-center px-0",
        active
          ? mobile
            ? mobileNavLinkActiveClass
            : desktopNavLinkActiveClass
          : mobile
            ? mobileNavLinkIdleClass
            : desktopNavLinkIdleClass
      )}
      title={collapsed ? description ?? label : undefined}
    >
      {Icon ? <Icon data-icon="inline-start" /> : null}
      <span className={cn(!mobile && collapsed && "sr-only")}>{label}</span>
    </Link>
  )
}
