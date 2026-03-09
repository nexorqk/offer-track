import "server-only"

import { createHash, randomBytes } from "node:crypto"

import { and, eq, gt } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { sessions, users } from "@/lib/db/schema"

const SESSION_COOKIE_NAME = "offer_track_session"
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30

export type SessionUser = {
  id: string
  email: string
}

function createSessionToken() {
  return randomBytes(32).toString("base64url")
}

function hashSessionToken(sessionToken: string) {
  return createHash("sha256").update(sessionToken).digest("hex")
}

async function setSessionCookie(sessionToken: string, expiresAt: Date) {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  return user ?? null
}

export async function createUser(email: string, passwordHash: string) {
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
    })
    .returning({
      id: users.id,
      email: users.email,
    })

  return user
}

export async function createSession(userId: string) {
  const sessionToken = createSessionToken()
  const sessionTokenHash = hashSessionToken(sessionToken)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await db.insert(sessions).values({
    userId,
    sessionTokenHash,
    expiresAt,
  })

  await setSessionCookie(sessionToken, expiresAt)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  const [result] = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.sessionTokenHash, hashSessionToken(sessionToken)),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1)

  if (!result) {
    cookieStore.delete(SESSION_COOKIE_NAME)
    return null
  }

  return result
}

export async function requireCurrentUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function clearSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    await db
      .delete(sessions)
      .where(eq(sessions.sessionTokenHash, hashSessionToken(sessionToken)))
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}
