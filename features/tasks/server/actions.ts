"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireCurrentUser } from "@/features/auth/server/auth"
import { db } from "@/lib/db"
import { tasks } from "@/lib/db/schema"

type TaskToggleFieldName = "completed"

export type TaskToggleActionState = {
  fieldErrors?: Partial<Record<TaskToggleFieldName, string[]>>
  message?: string
  status: "error" | "idle" | "success"
}

export const initialTaskToggleState: TaskToggleActionState = {
  status: "idle",
}

const taskToggleSchema = z.object({
  completed: z
    .string()
    .trim()
    .refine(
      (value) => value === "true" || value === "false",
      "Select a valid completion state",
    )
    .transform((value) => value === "true"),
})

export async function toggleTaskCompletionAction(
  _previousState: TaskToggleActionState,
  formData: FormData,
): Promise<TaskToggleActionState> {
  const user = await requireCurrentUser()
  const taskId = getString(formData, "taskId")

  if (!taskId) {
    return {
      message: "Task identifier is missing.",
      status: "error",
    }
  }

  const parsed = taskToggleSchema.safeParse({
    completed: getString(formData, "completed"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Fix the highlighted fields and try again.",
      status: "error",
    }
  }

  const [task] = await db
    .select({
      id: tasks.id,
      jobId: tasks.jobId,
    })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
    .limit(1)

  if (!task) {
    return {
      message: "This task no longer exists.",
      status: "error",
    }
  }

  await db
    .update(tasks)
    .set({
      completed: parsed.data.completed,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))

  revalidatePath("/dashboard")
  revalidatePath(`/jobs/${task.jobId}`)
  revalidatePath("/tasks")

  return {
    message: parsed.data.completed ? "Task marked as done." : "Task moved back to open.",
    status: "success",
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}
