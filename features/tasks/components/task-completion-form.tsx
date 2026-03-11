"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { CheckCheck, RotateCcw } from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"
import {
  initialTaskToggleState,
  toggleTaskCompletionAction,
} from "@/features/tasks/server/actions"
import { cn } from "@/lib/utils"

type TaskCompletionFormProps = {
  completed: boolean
  taskId: string
}

export function TaskCompletionForm({
  completed,
  taskId,
}: Readonly<TaskCompletionFormProps>) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    toggleTaskCompletionAction,
    initialTaskToggleState,
  )

  React.useEffect(() => {
    if (state.status !== "success") {
      return
    }

    router.refresh()
  }, [router, state.status])

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={formAction}>
        <input type="hidden" name="taskId" value={taskId} />
        <input type="hidden" name="completed" value={completed ? "false" : "true"} />
        <button
          type="submit"
          className={cn(
            buttonVariants({
              size: "sm",
              variant: completed ? "outline" : "secondary",
            }),
          )}
          disabled={isPending}
        >
          {completed ? <RotateCcw data-icon="inline-start" /> : <CheckCheck data-icon="inline-start" />}
          {isPending ? "Saving..." : completed ? "Reopen" : "Mark done"}
        </button>
      </form>
      {state.status === "error" && state.message ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </div>
  )
}
