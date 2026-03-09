import { SESSION_COOKIE_NAME } from "@/features/auth/session"

export const DEFAULT_AUTHENTICATED_REDIRECT = "/dashboard"

const guestOnlyRoutes = new Set(["/login", "/register"])
const protectedRoutePrefixes = [
  "/dashboard",
  "/jobs",
  "/companies",
  "/contacts",
  "/tasks",
  "/analytics",
  "/settings",
]

export { SESSION_COOKIE_NAME }

export function normalizeRedirectTarget(target: string | null | undefined) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return DEFAULT_AUTHENTICATED_REDIRECT
  }

  return target
}

function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function getAuthRedirect(
  pathname: string,
  search: string,
  hasSession: boolean
) {
  if (hasSession && guestOnlyRoutes.has(pathname)) {
    return DEFAULT_AUTHENTICATED_REDIRECT
  }

  if (!hasSession && isProtectedRoute(pathname)) {
    const redirectTarget = normalizeRedirectTarget(`${pathname}${search}`)

    return `/login?redirectTo=${encodeURIComponent(redirectTarget)}`
  }

  return null
}
