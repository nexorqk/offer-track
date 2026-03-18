"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { logoutAction } from "@/features/auth/server/actions"
import { cn } from "@/lib/utils"

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
    <div className="shell-app-bg">
      <div className="mx-auto flex min-h-svh max-w-[92rem] gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <aside
          className={cn(
            "hidden shrink-0 transition-[width] duration-300 lg:flex",
            collapsed ? "w-28" : "w-[20rem]"
          )}
        >
          <div className="shell-rail-surface flex h-full flex-col justify-between rounded-[2.4rem] p-3">
            <div className="flex flex-col gap-5">
              <div
                className={cn(
                  "shell-brand-surface relative overflow-hidden",
                  collapsed ? "rounded-[1.85rem] p-3" : "rounded-[2rem] p-4"
                )}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%)]" />
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        collapsed && "w-full justify-center"
                      )}
                    >
                      <span className="flex size-9 items-center justify-center rounded-[1rem] border border-white/12 bg-white/10 shadow-sm">
                        <Sparkles className="size-4" />
                      </span>
                      {collapsed ? null : (
                        <div className="flex min-w-0 flex-col">
                          <span className="text-[0.68rem] font-medium tracking-[0.28em] text-[color:var(--shell-rail-muted)] uppercase">
                            Offer Track
                          </span>
                          <span className="font-display text-lg leading-none font-semibold text-[color:var(--shell-rail-foreground)]">
                            Command deck
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={
                        collapsed ? "Expand sidebar" : "Collapse sidebar"
                      }
                      className="border border-white/10 bg-white/8 text-[color:var(--shell-rail-foreground)] hover:bg-white/14 hover:text-[color:var(--shell-rail-foreground)]"
                      onClick={toggleCollapsed}
                    >
                      {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                    </Button>
                  </div>
                  {collapsed ? null : (
                    <div className="flex flex-col gap-3">
                      <div className="inline-flex self-start rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[0.66rem] font-medium tracking-[0.24em] text-[color:var(--shell-rail-muted)] uppercase">
                        Warm command center
                      </div>
                      <h1 className="font-display text-[1.65rem] leading-[1.05] font-semibold text-[color:var(--shell-rail-foreground)]">
                        Run your search through a shell with real point of view.
                      </h1>
                      <p className="text-sm leading-6 text-[color:var(--shell-rail-muted)]">
                        Pipeline, people, tasks, and signals stay inside one
                        focused deck built for daily decisions.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {dashboardNavigationSections.map((section) => (
                  <section
                    key={section.heading}
                    className={cn(
                      "flex flex-col gap-2",
                      collapsed
                        ? "items-center"
                        : "rounded-[1.7rem] border border-white/8 bg-white/5 p-3"
                    )}
                  >
                    {collapsed ? (
                      <div className="shell-divider h-px w-10 rounded-full" />
                    ) : (
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[0.68rem] font-medium tracking-[0.24em] text-[color:var(--shell-rail-muted)] uppercase">
                          {section.heading}
                        </span>
                        <ChevronRight className="size-3.5 text-[color:var(--shell-rail-muted)]" />
                      </div>
                    )}
                    <nav
                      className={cn(
                        "flex flex-col gap-2",
                        collapsed && "items-center"
                      )}
                    >
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
              <div className="shell-brand-surface flex flex-col items-center gap-3 rounded-[1.85rem] p-3">
                <div className="flex size-11 items-center justify-center rounded-[1.2rem] border border-white/12 bg-white/10 text-sm font-semibold text-[color:var(--shell-rail-foreground)]">
                  {userEmail.slice(0, 1).toUpperCase()}
                </div>
                <form action={logoutAction}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Log out"
                    className="border border-white/10 bg-white/8 text-[color:var(--shell-rail-foreground)] hover:bg-white/14 hover:text-[color:var(--shell-rail-foreground)]"
                  >
                    <LogOut />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="shell-brand-surface flex flex-col gap-3 rounded-[2rem] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-[1.2rem] border border-white/12 bg-white/10 text-sm font-semibold text-[color:var(--shell-rail-foreground)] shadow-sm">
                      {userEmail.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-[0.68rem] font-medium tracking-[0.24em] text-[color:var(--shell-rail-muted)] uppercase">
                        Session
                      </span>
                      <p className="truncate text-sm font-medium text-[color:var(--shell-rail-foreground)]">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-500/14 px-2 py-1 text-[0.68rem] font-medium text-emerald-100">
                    Live
                  </span>
                </div>
                <form action={logoutAction}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center border border-white/10 bg-white/8 text-[color:var(--shell-rail-foreground)] hover:bg-white/14 hover:text-[color:var(--shell-rail-foreground)]"
                  >
                    Log out
                  </Button>
                </form>
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6">
          <header className="shell-topbar-surface flex flex-col gap-4 rounded-[2.2rem] px-4 py-4 sm:px-5 lg:sticky lg:top-4 lg:z-10 lg:flex-row lg:items-end lg:justify-between">
            <DashboardSectionHeader />

            <div className="flex flex-col items-start gap-3 self-start sm:self-auto lg:items-end">
              <div className="flex items-center gap-2 lg:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="rounded-[1.2rem] border-[color:var(--shell-panel-border)] bg-[color:var(--shell-panel)] hover:bg-[color:var(--shell-panel-muted)]"
                  onClick={toggleCollapsed}
                >
                  {collapsed ? (
                    <PanelLeftOpen data-icon="inline-start" />
                  ) : (
                    <PanelLeftClose data-icon="inline-start" />
                  )}
                  {collapsed ? "Expand nav" : "Collapse nav"}
                </Button>
              </div>

              <div className="shell-surface-muted flex flex-wrap items-center gap-2 rounded-[1.6rem] p-1.5">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={cn(
                      buttonVariants({
                        size: "sm",
                        variant: index === 0 ? "default" : "ghost",
                      }),
                      index === 0
                        ? "rounded-[1.1rem] border border-black/5 bg-[color:var(--foreground)] text-[color:var(--background)] shadow-sm hover:bg-[color:var(--foreground)]/92"
                        : "rounded-[1.1rem] border border-transparent bg-transparent hover:bg-[color:var(--shell-panel)]"
                    )}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          <section className="shell-mobile-nav grid grid-cols-3 gap-2 rounded-[1.85rem] p-2 sm:grid-cols-4 lg:hidden">
            {mobileNavigation.map((item) => (
              <DashboardNavLink key={item.href} {...item} mobile />
            ))}
          </section>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
