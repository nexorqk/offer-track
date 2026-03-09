import { describe, expect, it } from "vitest"

import {
  DEFAULT_AUTHENTICATED_REDIRECT,
  getAuthRedirect,
  normalizeRedirectTarget,
} from "@/features/auth/route-protection"

describe("route protection", () => {
  it("redirects guests from protected routes to login with redirect target", () => {
    expect(getAuthRedirect("/jobs/123", "?tab=notes", false)).toBe(
      "/login?redirectTo=%2Fjobs%2F123%3Ftab%3Dnotes"
    )
  })

  it("redirects authenticated users away from guest-only routes", () => {
    expect(getAuthRedirect("/login", "", true)).toBe(
      DEFAULT_AUTHENTICATED_REDIRECT
    )
    expect(getAuthRedirect("/register", "", true)).toBe(
      DEFAULT_AUTHENTICATED_REDIRECT
    )
  })

  it("does not redirect public routes", () => {
    expect(getAuthRedirect("/", "", false)).toBeNull()
    expect(getAuthRedirect("/", "", true)).toBeNull()
  })

  it("normalizes redirect targets to local app paths only", () => {
    expect(normalizeRedirectTarget("/jobs/123?tab=notes")).toBe(
      "/jobs/123?tab=notes"
    )
    expect(normalizeRedirectTarget("https://example.com")).toBe(
      DEFAULT_AUTHENTICATED_REDIRECT
    )
    expect(normalizeRedirectTarget("//evil.com")).toBe(
      DEFAULT_AUTHENTICATED_REDIRECT
    )
    expect(normalizeRedirectTarget("jobs")).toBe(DEFAULT_AUTHENTICATED_REDIRECT)
  })
})
