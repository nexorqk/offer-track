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
  href: string
  label: string
  icon?: keyof typeof iconMap
  mobile?: boolean
}

const desktopNavLinkClass =
  "inline-flex h-9 items-center justify-start gap-1.5 rounded-2xl px-3 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const desktopNavLinkActiveClass =
  "bg-secondary text-secondary-foreground hover:bg-secondary/80"

const desktopNavLinkIdleClass = "hover:bg-muted hover:text-foreground"

const mobileNavLinkClass =
  "inline-flex h-7 shrink-0 items-center justify-center rounded-2xl px-2.5 text-[0.8rem] font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const mobileNavLinkActiveClass =
  "bg-secondary text-secondary-foreground hover:bg-secondary/80"

const mobileNavLinkIdleClass = "hover:bg-muted hover:text-foreground"

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardNavLink({
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
      className={cn(
        mobile ? mobileNavLinkClass : desktopNavLinkClass,
        active
          ? mobile
            ? mobileNavLinkActiveClass
            : desktopNavLinkActiveClass
          : mobile
            ? mobileNavLinkIdleClass
            : desktopNavLinkIdleClass
      )}
    >
      {Icon ? <Icon data-icon="inline-start" /> : null}
      {label}
    </Link>
  )
}
