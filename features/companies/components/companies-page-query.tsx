"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { CompaniesPageContent } from "@/features/companies/components/companies-page-content"
import { getCompaniesPageDataAction } from "@/features/companies/server/query-actions"
import { companiesQueryKeys } from "@/lib/query-keys"

type CompaniesPageQueryProps = Awaited<ReturnType<typeof getCompaniesPageDataAction>>

export function CompaniesPageQuery(props: Readonly<CompaniesPageQueryProps>) {
  const queryClient = useQueryClient()
  const initialData = React.useMemo(() => props, [props])
  const queryKey = React.useMemo(() => companiesQueryKeys.list(), [])
  const query = useQuery({
    initialData,
    queryFn: getCompaniesPageDataAction,
    queryKey,
  })

  React.useEffect(() => {
    queryClient.setQueryData(queryKey, initialData)
  }, [initialData, queryClient, queryKey])

  const data = query.data ?? initialData

  if (!data) {
    return (
      <div className="rounded-[2rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
        Loading companies...
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {query.isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not refresh companies right now. Showing the latest loaded snapshot.
        </div>
      ) : null}
      <CompaniesPageContent {...data} />
    </div>
  )
}
