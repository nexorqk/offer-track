"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { NotesPageContent } from "@/features/notes/components/notes-page-content"
import { getNotesPageDataAction } from "@/features/notes/server/query-actions"
import { notesQueryKeys } from "@/lib/query-keys"

type NotesPageQueryProps = {
  initialData: Awaited<ReturnType<typeof getNotesPageDataAction>>
}

export function NotesPageQuery({ initialData }: Readonly<NotesPageQueryProps>) {
  const queryClient = useQueryClient()
  const queryKey = React.useMemo(() => notesQueryKeys.list(), [])
  const query = useQuery({
    initialData,
    queryFn: getNotesPageDataAction,
    queryKey,
  })

  React.useEffect(() => {
    queryClient.setQueryData(queryKey, initialData)
  }, [initialData, queryClient, queryKey])

  const data = query.data ?? initialData

  if (!data) {
    return (
      <div className="rounded-[2rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
        Loading notes...
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {query.isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not refresh notes right now. Showing the latest loaded snapshot.
        </div>
      ) : null}
      <NotesPageContent {...data} />
    </div>
  )
}
