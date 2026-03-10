import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { JobForm } from "@/features/jobs/components/job-form"
import {
  emptyJobFormValues,
  initialJobFormState,
  type JobFormState,
} from "@/features/jobs/types/job"

describe("JobForm", () => {
  it("shows visible feedback when client-side validation blocks submit", async () => {
    const user = userEvent.setup()
    const action = vi.fn(
      async (_state: JobFormState, _formData: FormData) => initialJobFormState
    )

    render(
      <JobForm
        action={action}
        companyOptions={[]}
        description="Create a job"
        initialValues={emptyJobFormValues}
        submitLabel="Create job"
        title="Add a role"
      />
    )

    await user.click(screen.getByRole("button", { name: "Create job" }))

    expect(action).not.toHaveBeenCalled()
    expect(screen.getAllByText("Job title is required")).toHaveLength(2)
    expect(screen.getAllByText("Company name is required")).toHaveLength(2)

    const alert = screen.getByRole("alert", { name: "Form validation errors" })

    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent("Fix the highlighted fields and try again.")
  })

  it("submits valid data to the action", async () => {
    const user = userEvent.setup()
    const action = vi.fn(
      async (_state: JobFormState, _formData: FormData) => initialJobFormState
    )

    render(
      <JobForm
        action={action}
        companyOptions={[]}
        description="Create a job"
        initialValues={emptyJobFormValues}
        submitLabel="Create job"
        title="Add a role"
      />
    )

    await user.type(screen.getByLabelText("Role title"), "Senior Frontend Engineer")
    await user.type(screen.getByLabelText("Company"), "Atlas Labs")
    await user.click(screen.getByRole("button", { name: "Create job" }))

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))

    const submittedFormData = action.mock.calls[0][1]

    expect(submittedFormData).toBeInstanceOf(FormData)
    expect(submittedFormData.get("title")).toBe("Senior Frontend Engineer")
    expect(submittedFormData.get("companyName")).toBe("Atlas Labs")
  })
})
