export type DashboardNavIcon =
  | "analytics"
  | "companies"
  | "contacts"
  | "dashboard"
  | "jobs"
  | "notes"
  | "settings"
  | "tasks"

export type DashboardNavigationItem = {
  description: string
  group: "Review" | "Track" | "Workspace"
  href: string
  icon: DashboardNavIcon
  label: string
  title: string
}

export type DashboardBreadcrumb = {
  href?: string
  label: string
}

export const dashboardNavigationSections = [
  {
    heading: "Track",
    items: [
      {
        description: "High-level overview of your pipeline and current focus.",
        group: "Track",
        href: "/dashboard",
        icon: "dashboard",
        label: "Dashboard",
        title: "Command center",
      },
      {
        description: "Active applications, stages, notes, and offer pipeline.",
        group: "Track",
        href: "/jobs",
        icon: "jobs",
        label: "Jobs",
        title: "Job pipeline",
      },
      {
        description: "Reusable long-form notes, drafts, prep material, and search thinking.",
        group: "Track",
        href: "/notes",
        icon: "notes",
        label: "Notes",
        title: "Search notebook",
      },
      {
        description: "Company context, role inventory, and relationship history.",
        group: "Track",
        href: "/companies",
        icon: "companies",
        label: "Companies",
        title: "Company records",
      },
      {
        description: "Recruiters, hiring managers, interviewers, and follow-ups.",
        group: "Track",
        href: "/contacts",
        icon: "contacts",
        label: "Contacts",
        title: "People involved",
      },
      {
        description: "Upcoming deadlines, follow-ups, and interview prep tasks.",
        group: "Track",
        href: "/tasks",
        icon: "tasks",
        label: "Tasks",
        title: "Execution queue",
      },
    ],
  },
  {
    heading: "Review",
    items: [
      {
        description: "Conversion metrics, response rates, and funnel health.",
        group: "Review",
        href: "/analytics",
        icon: "analytics",
        label: "Analytics",
        title: "Performance view",
      },
    ],
  },
  {
    heading: "Workspace",
    items: [
      {
        description: "Profile defaults, auth settings, and workspace preferences.",
        group: "Workspace",
        href: "/settings",
        icon: "settings",
        label: "Settings",
        title: "Workspace settings",
      },
    ],
  },
] as const satisfies readonly {
  heading: string
  items: readonly DashboardNavigationItem[]
}[]

export const allDashboardNavigationItems: DashboardNavigationItem[] =
  dashboardNavigationSections.flatMap((section) => [...section.items])

export const mobileNavigation: DashboardNavigationItem[] =
  dashboardNavigationSections.flatMap((section) => [...section.items])

export function getDashboardNavigationItem(pathname: string) {
  return (
    allDashboardNavigationItems.find((item) =>
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? allDashboardNavigationItems[0]
  )
}

function getQuickActions(pathname: string) {
  if (pathname === "/jobs/new") {
    return [
      { href: "/jobs", label: "Back to jobs" },
      { href: "/contacts", label: "Recent contacts" },
      { href: "/tasks", label: "Upcoming follow-ups" },
    ]
  }

  if (pathname.startsWith("/jobs/")) {
    return [
      { href: "/jobs", label: "Back to jobs" },
      { href: "/companies", label: "Related companies" },
      { href: "/contacts", label: "Relevant contacts" },
    ]
  }

  const currentItem = getDashboardNavigationItem(pathname)

  switch (currentItem.href) {
    case "/dashboard":
      return [
        { href: "/jobs", label: "Open pipeline" },
        { href: "/tasks", label: "Review tasks" },
        { href: "/analytics", label: "See analytics" },
      ]
    case "/jobs":
      return [
        { href: "/notes", label: "Open notebook" },
        { href: "/companies", label: "Browse companies" },
        { href: "/contacts", label: "View contacts" },
      ]
    case "/notes":
      return [
        { href: "/jobs", label: "Back to pipeline" },
        { href: "/tasks", label: "Follow-up queue" },
        { href: "/dashboard", label: "Workspace overview" },
      ]
    case "/companies":
      return [
        { href: "/jobs", label: "Open roles" },
        { href: "/contacts", label: "Company contacts" },
        { href: "/analytics", label: "Source trends" },
      ]
    case "/contacts":
      return [
        { href: "/companies", label: "Company context" },
        { href: "/jobs", label: "Open applications" },
        { href: "/tasks", label: "Next touchpoints" },
      ]
    case "/tasks":
      return [
        { href: "/jobs", label: "Pipeline tasks" },
        { href: "/contacts", label: "People to follow up" },
        { href: "/dashboard", label: "Back to overview" },
      ]
    case "/analytics":
      return [
        { href: "/jobs", label: "Inspect pipeline" },
        { href: "/tasks", label: "Act on bottlenecks" },
        { href: "/dashboard", label: "Back to overview" },
      ]
    case "/settings":
      return [
        { href: "/dashboard", label: "Workspace overview" },
        { href: "/jobs", label: "Default workflow" },
      ]
    default:
      return []
  }
}

export function getDashboardBreadcrumbs(pathname: string): DashboardBreadcrumb[] {
  if (pathname === "/dashboard") {
    return [{ label: "Dashboard" }]
  }

  if (pathname === "/jobs/new") {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "Jobs" },
      { label: "New job" },
    ]
  }

  if (pathname.startsWith("/jobs/")) {
    const jobId = pathname.split("/")[2]

    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "Jobs" },
      { label: jobId ? `Job ${jobId}` : "Job detail" },
    ]
  }

  const currentItem = getDashboardNavigationItem(pathname)

  return [
    { href: "/dashboard", label: "Dashboard" },
    { label: currentItem.label },
  ]
}

export function getDashboardRouteContext(pathname: string) {
  const currentItem = getDashboardNavigationItem(pathname)

  if (pathname === "/jobs/new") {
    return {
      breadcrumbs: getDashboardBreadcrumbs(pathname),
      currentItem: {
        ...currentItem,
        description:
          "Capture a new opportunity before moving it through the pipeline.",
        group: "Track" as const,
        label: "New job",
        title: "Create job",
      },
      quickActions: getQuickActions(pathname),
    }
  }

  if (pathname.startsWith("/jobs/")) {
    const jobId = pathname.split("/")[2]

    return {
      breadcrumbs: getDashboardBreadcrumbs(pathname),
      currentItem: {
        ...currentItem,
        description:
          "Review notes, contacts, interview steps, and offer details for this opportunity.",
        group: "Track" as const,
        label: "Job detail",
        title: jobId ? `Job ${jobId}` : "Job detail",
      },
      quickActions: getQuickActions(pathname),
    }
  }

  return {
    breadcrumbs: getDashboardBreadcrumbs(pathname),
    currentItem,
    quickActions: getQuickActions(pathname),
  }
}
