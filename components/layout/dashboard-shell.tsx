"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { logoutAction } from "@/features/auth/server/actions"

import {
  getDashboardRouteContext,
  dashboardNavigationSections,
  mobileNavigation,
} from "./dashboard-navigation"
import { DashboardNavLink } from "./dashboard-nav-link"
import { DashboardSectionHeader } from "./dashboard-section-header"

const SIDEBAR_STORAGE_KEY = "offer-track-sidebar-collapsed"

export function DashboardShell({
  children,
  userEmail,
}: Readonly<{
  children: React.ReactNode
  userEmail: string
}>) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  })
  const { quickActions } = getDashboardRouteContext(pathname)

  function toggleCollapsed() {
    setCollapsed((currentValue) => {
      const nextValue = !currentValue
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue))
      return nextValue
    })
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <aside
        className={
          collapsed
            ? "hidden w-24 shrink-0 flex-col justify-between rounded-[2rem] border bg-background/90 p-3 shadow-sm backdrop-blur transition-[width,padding] duration-200 lg:flex"
            : "hidden w-72 shrink-0 flex-col justify-between rounded-[2rem] border bg-background/90 p-4 shadow-sm backdrop-blur transition-[width,padding] duration-200 lg:flex"
        }
      >
        <div className="flex flex-col gap-6">
          <div
            className={
              collapsed
                ? "rounded-[1.65rem] border bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklch,_var(--color-primary)_14%,_transparent),_transparent_30%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_42%,transparent))] p-3"
                : "rounded-[1.65rem] border bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklch,_var(--color-primary)_14%,_transparent),_transparent_30%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_42%,transparent))] p-4"
            }
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  {collapsed ? "OT" : "Offer Track"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  onClick={toggleCollapsed}
                >
                  {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                </Button>
              </div>
              {collapsed ? null : (
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl font-semibold tracking-tight">
                    Run your search like a compact operating system.
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Pipeline, people, tasks, and signals stay in one focused
                    shell.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {dashboardNavigationSections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-2">
                {collapsed ? (
                  <div className="mx-auto h-px w-8 bg-border" />
                ) : (
                  <span className="px-2 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    {section.heading}
                  </span>
                )}
                <nav className="flex flex-col gap-1.5">
                  {section.items.map((item) => (
                    <DashboardNavLink
                      key={item.href}
                      collapsed={collapsed}
                      {...item}
                    />
                  ))}
                </nav>
              </section>
            ))}
          </div>
        </div>

        {collapsed ? (
          <div className="flex flex-col items-center gap-3 rounded-[1.65rem] border bg-background p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
              {userEmail.slice(0, 1).toUpperCase()}
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="icon-sm" aria-label="Log out">
                <LogOut />
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-[1.65rem] border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Session
                </span>
                <p className="truncate text-sm font-medium">{userEmail}</p>
              </div>
              <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-[0.68rem] font-medium text-emerald-700 dark:text-emerald-300">
                Live
              </span>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6">
        <header className="flex flex-col gap-3 rounded-[2rem] border bg-background/90 px-4 py-4 shadow-sm backdrop-blur sm:px-5 lg:sticky lg:top-4 lg:z-10 lg:flex-row lg:items-center lg:justify-between">
          <DashboardSectionHeader />

          <div className="flex flex-col items-start gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={toggleCollapsed}
              >
                {collapsed ? <PanelLeftOpen data-icon="inline-start" /> : <PanelLeftClose data-icon="inline-start" />}
                {collapsed ? "Expand nav" : "Collapse nav"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {quickActions.map((action, index) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={buttonVariants({
                    size: "sm",
                    variant: index === 0 ? "default" : "outline",
                  })}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-2 rounded-[1.75rem] border bg-background/80 p-2 sm:grid-cols-4 lg:hidden">
          {mobileNavigation.map((item) => (
            <DashboardNavLink key={item.href} {...item} mobile />
          ))}
        </section>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
