"use client"

import * as React from "react"
import { useActionState, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookText,
  FileText,
  NotebookText,
  PencilLine,
  Trash2,
} from "lucide-react"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  createWorkspaceNoteAction,
  deleteWorkspaceNoteAction,
  updateWorkspaceNoteAction,
} from "@/features/notes/server/actions"
import {
  initialWorkspaceNoteState,
  type WorkspaceNoteActionState,
} from "@/features/notes/types/actions"
import type { NotesPageData } from "@/features/notes/server/queries"
import { cn } from "@/lib/utils"

const textareaClassName =
  "min-h-36 w-full rounded-[1.2rem] border bg-background px-3 py-3 text-sm leading-6 shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const inputClassName =
  "h-11 w-full rounded-[1rem] border bg-background px-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type NotesPageContentProps = NotesPageData

export function NotesPageContent({
  items,
  summary,
}: Readonly<NotesPageContentProps>) {
  return (
    <div className="flex flex-col gap-5 pb-8">
      <section>
        <article className="overflow-hidden rounded-[2.25rem] border bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_92%,transparent),color-mix(in_oklch,var(--color-muted)_20%,transparent))] p-5 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Search notebook
              </span>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    Keep outreach drafts, prep notes, and loose thinking in one place.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Capture reusable recruiter messages, interview prep, salary framing, and any
                    long-form text that should stay close to your job search workspace.
                  </p>
                </div>
                <span
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "pointer-events-none rounded-full",
                  )}
                >
                  <NotebookText data-icon="inline-start" />
                  {summary.totalNotes} saved
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryCard
                icon={NotebookText}
                label="Notes"
                note="Saved in this workspace"
                value={String(summary.totalNotes)}
              />
              <SummaryCard
                icon={PencilLine}
                label="Updated this week"
                note="Recently touched entries"
                value={String(summary.updatedThisWeek)}
              />
              <SummaryCard
                icon={BookText}
                label="Words"
                note="Across every saved note"
                value={String(summary.totalWords)}
              />
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
        <WorkspaceNoteComposer />

        <article className="overflow-hidden rounded-[2.25rem] border bg-background/92 shadow-sm">
          <div className="border-b px-5 py-4">
            <div className="flex flex-col gap-2">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Saved entries
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold tracking-tight">All workspace notes</h2>
                <p className="text-sm text-muted-foreground">
                  {summary.totalNotes === 0
                    ? "Create the first note for outreach drafts, prep checklists, or search strategy."
                    : `${summary.totalNotes} notes ordered by most recent update.`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4">
            {items.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
                No notes yet. Start with a recruiter outreach draft, interview prep outline, or a
                running search log.
              </div>
            ) : (
              items.map((note) => <WorkspaceNoteCard key={note.id} note={note} />)
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

function WorkspaceNoteComposer() {
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    createWorkspaceNoteAction,
    initialWorkspaceNoteState,
  )

  React.useEffect(() => {
    if (state.status !== "success") {
      return
    }

    formRef.current?.reset()
    React.startTransition(() => {
      router.refresh()
    })
  }, [router, state.status])

  return (
    <article className="rounded-[2.25rem] border bg-background/92 p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              New note
            </span>
            <h2 className="text-2xl font-semibold tracking-tight">Add a reusable text block</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Store anything that should not live on a single job card.
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <NotebookText className="size-4" />
          </div>
        </div>

        <form ref={formRef} action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="create-note-title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="create-note-title"
              name="title"
              className={inputClassName}
              placeholder="Recruiter outreach template"
            />
            <FieldError error={state.fieldErrors?.title?.[0]} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="create-note-content" className="text-sm font-medium">
              Note text
            </label>
            <textarea
              id="create-note-content"
              name="content"
              className={textareaClassName}
              placeholder="Write the full draft, prep outline, or search notes here."
            />
            <FieldError error={state.fieldErrors?.content?.[0]} />
          </div>

          <FormMessage state={state} />

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Use full sentences here. This route is meant for long-form context, not tiny tags.
            </p>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save note"}
            </Button>
          </div>
        </form>
      </div>
    </article>
  )
}

function WorkspaceNoteCard({
  note,
}: Readonly<{
  note: NotesPageData["items"][number]
}>) {
  const deleteFormRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [updateState, updateAction, isUpdatePending] = useActionState(
    updateWorkspaceNoteAction,
    initialWorkspaceNoteState,
  )
  const [deleteState, deleteAction, isDeletePending] = useActionState(
    deleteWorkspaceNoteAction,
    initialWorkspaceNoteState,
  )

  React.useEffect(() => {
    if (updateState.status !== "success" && deleteState.status !== "success") {
      return
    }

    setConfirmDelete(false)
    React.startTransition(() => {
      router.refresh()
    })
  }, [deleteState.status, router, updateState.status])

  return (
    <>
      <article className="rounded-[1.75rem] border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-background)_96%,transparent),color-mix(in_oklch,var(--color-muted)_16%,transparent))] p-5 shadow-[0_1px_0_color-mix(in_oklch,var(--color-foreground)_5%,transparent)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-muted/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em]">
                Updated {formatDate(note.updatedAt)}
              </span>
              <span className="rounded-full bg-muted/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em]">
                {countWords(note.content)} words
              </span>
            </div>
            <form ref={deleteFormRef} action={deleteAction}>
              <input type="hidden" name="noteId" value={note.id} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 data-icon="inline-start" />
                Delete
              </Button>
            </form>
          </div>

          <form action={updateAction} className="grid gap-4">
            <input type="hidden" name="noteId" value={note.id} />

            <div className="grid gap-2">
              <label htmlFor={`note-title-${note.id}`} className="text-sm font-medium">
                Title
              </label>
              <input
                id={`note-title-${note.id}`}
                name="title"
                defaultValue={note.title}
                className={inputClassName}
              />
              <FieldError error={updateState.fieldErrors?.title?.[0]} />
            </div>

            <div className="grid gap-2">
              <label htmlFor={`note-content-${note.id}`} className="text-sm font-medium">
                Note text
              </label>
              <textarea
                id={`note-content-${note.id}`}
                name="content"
                defaultValue={note.content}
                className={textareaClassName}
              />
              <FieldError error={updateState.fieldErrors?.content?.[0]} />
            </div>

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-sm text-muted-foreground">
                Created {formatDate(note.createdAt)}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <FormMessage state={updateState} />
                <Button type="submit" disabled={isUpdatePending}>
                  <FileText data-icon="inline-start" />
                  {isUpdatePending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </form>

          {deleteState.status === "error" && deleteState.message ? (
            <p className="text-sm text-destructive">{deleteState.message}</p>
          ) : null}
        </div>
      </article>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete note"
        description="This removes the note from the workspace. Use this only when the text is no longer useful."
        confirmLabel="Delete note"
        tone="destructive"
        isPending={isDeletePending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteFormRef.current?.requestSubmit()}
      />
    </>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  note,
  value,
}: Readonly<{
  icon: typeof NotebookText
  label: string
  note: string
  value: string
}>) {
  return (
    <article className="rounded-[1.5rem] border bg-background/80 p-4 shadow-[0_1px_0_color-mix(in_oklch,var(--color-foreground)_5%,transparent)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{note}</p>
    </article>
  )
}

function FieldError({ error }: Readonly<{ error?: string }>) {
  if (!error) {
    return null
  }

  return <p className="text-sm text-destructive">{error}</p>
}

function FormMessage({
  state,
}: Readonly<{
  state: WorkspaceNoteActionState
}>) {
  if (!state.message || state.status === "success") {
    return null
  }

  return <p className="text-sm text-destructive">{state.message}</p>
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value)
}

function countWords(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    return 0
  }

  return normalized.split(/\s+/).length
}
