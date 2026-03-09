import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AuthForm } from "@/features/auth/components/auth-form"

const mockAction = vi.fn()

describe("AuthForm", () => {
  it("renders login fields", () => {
    render(
      <AuthForm
        action={mockAction}
        alternateHref="/register"
        alternateLabel="Create one"
        alternateText="Need an account?"
        mode="login"
        submitLabel="Log in"
        title="Log in"
        description="Access your workspace"
      />
    )

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.queryByLabelText("Confirm password")).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", {
        name: "Log in",
      })
    ).toBeInTheDocument()
  })

  it("renders confirm password for registration", () => {
    render(
      <AuthForm
        action={mockAction}
        alternateHref="/login"
        alternateLabel="Log in"
        alternateText="Already have an account?"
        mode="register"
        submitLabel="Create account"
        title="Create account"
        description="Start tracking offers"
      />
    )

    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument()
  })
})
