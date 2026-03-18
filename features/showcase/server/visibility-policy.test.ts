import { describe, expect, it } from "vitest"

import {
  canPublishNoteToShowcase,
  getNoteVisibilityValidationMessage,
  getPublicJobView,
  isPublicVisibilityProfile,
} from "@/features/showcase/server/visibility-policy"

describe("showcase visibility policy", () => {
  it("detects the public showcase visibility profile", () => {
    expect(isPublicVisibilityProfile("private")).toBe(false)
    expect(isPublicVisibilityProfile("shared")).toBe(false)
    expect(isPublicVisibilityProfile("public_showcase")).toBe(true)
  })

  it("allows only reflection and update notes in the public showcase", () => {
    expect(
      canPublishNoteToShowcase({
        noteKind: "reflection",
        visibilityProfile: "public_showcase",
      }),
    ).toBe(true)

    expect(
      canPublishNoteToShowcase({
        noteKind: "update",
        visibilityProfile: "public_showcase",
      }),
    ).toBe(true)

    expect(
      canPublishNoteToShowcase({
        noteKind: "internal",
        visibilityProfile: "public_showcase",
      }),
    ).toBe(false)
  })

  it("returns a validation message when an internal note is marked public", () => {
    expect(
      getNoteVisibilityValidationMessage({
        noteKind: "internal",
        visibilityProfile: "public_showcase",
      }),
    ).toBe(
      "Only reflection and update notes can be published to the public showcase.",
    )

    expect(
      getNoteVisibilityValidationMessage({
        noteKind: "internal",
        visibilityProfile: "private",
      }),
    ).toBeNull()
  })

  it("builds a public job view without leaking extra fields", () => {
    expect(
      getPublicJobView({
        appliedAt: new Date("2026-03-18T00:00:00.000Z"),
        companyName: "Atlas Labs",
        description: "Internal full description",
        location: "Remote, EU",
        publicId: "public-job-1",
        publicSummary: "Shaping the candidate platform UX.",
        source: "LinkedIn",
        status: "applied",
        title: "Senior Frontend Engineer",
        updatedAt: new Date("2026-03-18T10:00:00.000Z"),
        workMode: "remote",
      }),
    ).toEqual({
      appliedAt: new Date("2026-03-18T00:00:00.000Z"),
      companyName: "Atlas Labs",
      description: "Internal full description",
      location: "Remote, EU",
      publicId: "public-job-1",
      publicSummary: "Shaping the candidate platform UX.",
      source: "LinkedIn",
      status: "applied",
      title: "Senior Frontend Engineer",
      updatedAt: new Date("2026-03-18T10:00:00.000Z"),
      workMode: "remote",
    })
  })
})
