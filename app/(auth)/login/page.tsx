import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Auth
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
        <p className="text-sm text-muted-foreground">
          This route is scaffolded for your authentication form and session
          recovery flow.
        </p>
      </div>

      <div className="grid gap-3 rounded-[1.75rem] border bg-muted/30 p-4">
        <div className="rounded-[1.25rem] border bg-background px-4 py-3 text-sm text-muted-foreground">
          Email and password inputs will live here.
        </div>
        <Button size="lg">Continue</Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href="/register" className="text-foreground underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
