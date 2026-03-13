"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastTone = "error" | "info" | "success"

type ToastItem = {
  id: number
  message: string
  title?: string
  tone: ToastTone
}

const toastToneClassName: Record<ToastTone, string> = {
  error:
    "border-destructive/20 bg-destructive/10 text-destructive",
  info:
    "border-border bg-background/95 text-foreground",
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export function useToastQueue() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const timeoutIdsRef = React.useRef(new Map<number, number>())

  const dismissToast = React.useCallback((id: number) => {
    const timeoutId = timeoutIdsRef.current.get(id)

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
      timeoutIdsRef.current.delete(id)
    }

    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = React.useCallback(
    ({
      message,
      title,
      tone = "info",
    }: {
      message: string
      title?: string
      tone?: ToastTone
    }) => {
      const id = Date.now() + Math.floor(Math.random() * 1000)

      setToasts((current) => [...current, { id, message, title, tone }])

      timeoutIdsRef.current.set(
        id,
        window.setTimeout(() => {
          dismissToast(id)
        }, 4000),
      )
    },
    [dismissToast],
  )

  React.useEffect(
    () => () => {
      for (const timeoutId of timeoutIdsRef.current.values()) {
        window.clearTimeout(timeoutId)
      }

      timeoutIdsRef.current.clear()
    },
    [],
  )

  return {
    dismissToast,
    pushToast,
    toasts,
  }
}

export function ToastViewport({
  dismissToast,
  toasts,
}: Readonly<{
  dismissToast: (id: number) => void
  toasts: ToastItem[]
}>) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 grid w-full max-w-sm gap-2">
      {toasts.map((toast) => (
        <section
          key={toast.id}
          aria-live="polite"
          className={cn(
            "pointer-events-auto rounded-[1.35rem] border px-4 py-3 shadow-lg backdrop-blur",
            toastToneClassName[toast.tone],
          )}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {toast.title ? (
                <p className="text-sm font-semibold text-foreground">{toast.title}</p>
              ) : null}
              <p className={cn("text-sm", toast.title ? "mt-1" : "")}>{toast.message}</p>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="rounded-full border bg-background/80 p-1 text-muted-foreground transition-colors hover:bg-muted"
              onClick={() => dismissToast(toast.id)}
            >
              <X className="size-4" />
            </button>
          </div>
        </section>
      ))}
    </div>
  )
}
