"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { ContactsPageContent } from "@/features/contacts/components/contacts-page-content"
import { getContactsPageDataAction } from "@/features/contacts/server/query-actions"
import { contactsQueryKeys } from "@/lib/query-keys"

type ContactsPageQueryProps = Awaited<ReturnType<typeof getContactsPageDataAction>>

export function ContactsPageQuery(props: Readonly<ContactsPageQueryProps>) {
  const queryClient = useQueryClient()
  const initialData = React.useMemo(() => props, [props])
  const queryKey = React.useMemo(() => contactsQueryKeys.list(), [])
  const query = useQuery({
    initialData,
    queryFn: getContactsPageDataAction,
    queryKey,
  })

  React.useEffect(() => {
    queryClient.setQueryData(queryKey, initialData)
  }, [initialData, queryClient, queryKey])

  const data = query.data ?? initialData

  if (!data) {
    return (
      <div className="rounded-[2rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
        Loading contacts...
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {query.isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not refresh contacts right now. Showing the latest loaded snapshot.
        </div>
      ) : null}
      <ContactsPageContent {...data} />
    </div>
  )
}
