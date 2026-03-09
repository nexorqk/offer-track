import type { Metadata } from "next"
import Link from "next/link"
import { BriefcaseBusiness, ChartColumnBig, Clock3, Search } from "lucide-react"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const navigation = [
  { href: "/", label: "Overview", icon: ChartColumnBig },
  { href: "/", label: "Pipeline", icon: BriefcaseBusiness },
  { href: "/", label: "Calendar", icon: Clock3 },
]

export const metadata: Metadata = {
  title: {
    default: "Offer Track",
    template: "%s | Offer Track",
  },
  description: "Track applications, interviews, and offers in one place.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
    >
      <body className="min-h-svh bg-gradient-to-b from-background via-background to-muted/30 text-foreground">
        <ThemeProvider>
          <div className="mx-auto flex min-h-svh max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <aside className="hidden w-68 shrink-0 flex-col justify-between rounded-[2rem] border bg-background/90 p-4 shadow-sm backdrop-blur lg:flex">
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
                      Keep your pipeline, interviews, and offers in one focused
                      workspace.
                    </p>
                  </div>
                </div>

                <nav className="flex flex-col gap-2">
                  {navigation.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      className={buttonVariants({
                        variant: label === "Overview" ? "secondary" : "ghost",
                        size: "lg",
                        className: "justify-start rounded-2xl",
                      })}
                    >
                      <Icon data-icon="inline-start" />
                      {label}
                    </Link>
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
                      Keep every opportunity in one flow
                    </h2>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                      Start with a small pipeline and evolve it into a complete
                      offers tracker.
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
                  <Link
                    key={label}
                    href={href}
                    className={buttonVariants({
                      variant: label === "Overview" ? "secondary" : "ghost",
                      size: "sm",
                      className: "shrink-0 rounded-2xl",
                    })}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <main className="min-w-0 flex-1">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
