"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel,
  description,
  isPending = false,
  onCancel,
  onConfirm,
  open,
  title,
  tone = "default",
}: Readonly<{
  cancelLabel?: string
  confirmLabel: string
  description: string
  isPending?: boolean
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title: string
  tone?: "default" | "destructive"
}>) {
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    cancelButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onCancel, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close confirmation dialog"
        className="absolute inset-0 bg-background/75 backdrop-blur-sm"
        onClick={onCancel}
      />

      <section className="relative z-10 grid w-full max-w-md gap-5 rounded-[2rem] border bg-background/95 p-5 shadow-2xl">
        <div className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={cancelButtonRef} type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Working..." : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  )
}
