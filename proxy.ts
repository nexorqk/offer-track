import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import {
  getAuthRedirect,
  SESSION_COOKIE_NAME,
} from "@/features/auth/route-protection"

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  const redirectTo = getAuthRedirect(
    request.nextUrl.pathname,
    request.nextUrl.search,
    hasSession
  )

  if (!redirectTo) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL(redirectTo, request.url))
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
