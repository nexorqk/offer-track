import "server-only"

import { desc, eq } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/lib/db"
import { companies, contacts, jobs } from "@/lib/db/schema"

export type ContactListItem = {
  companyId: string
  companyName: string
  createdAt: Date
  email: string | null
  id: string
  jobId: string | null
  jobTitle: string | null
  linkedinUrl: string | null
  name: string
  notes: string | null
  role: string | null
  updatedAt: Date
}

export type ContactsPageData = {
  items: ContactListItem[]
  summary: {
    companies: number
    linkedJobs: number
    totalContacts: number
  }
}

export const listContactsForUser = cache(async function listContactsForUser(
  userId: string,
): Promise<ContactsPageData> {
  const rows = await db
    .select({
      companyId: companies.id,
      companyName: companies.name,
      createdAt: contacts.createdAt,
      email: contacts.email,
      id: contacts.id,
      jobId: contacts.jobId,
      jobTitle: jobs.title,
      linkedinUrl: contacts.linkedinUrl,
      name: contacts.name,
      notes: contacts.notes,
      role: contacts.role,
      updatedAt: contacts.updatedAt,
    })
    .from(contacts)
    .innerJoin(companies, eq(contacts.companyId, companies.id))
    .leftJoin(jobs, eq(contacts.jobId, jobs.id))
    .where(eq(contacts.userId, userId))
    .orderBy(desc(contacts.updatedAt), desc(contacts.createdAt))

  return buildContactsPageData(rows satisfies ContactListItem[])
})

export function buildContactsPageData(rows: ContactListItem[]): ContactsPageData {
  const items = rows.toSorted(
    (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
  )

  return {
    items,
    summary: {
      companies: new Set(items.map((contact) => contact.companyId)).size,
      linkedJobs: items.filter((contact) => contact.jobId !== null).length,
      totalContacts: items.length,
    },
  }
}
