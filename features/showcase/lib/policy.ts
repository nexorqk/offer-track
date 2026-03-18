import type {
  NoteKindOption,
  VisibilityProfileOption,
} from "@/features/showcase/lib/visibility"

export function isPublicVisibilityProfile(value: VisibilityProfileOption) {
  return value === "public_showcase"
}

export function canPublishNoteToShowcase(input: {
  noteKind: NoteKindOption
  visibilityProfile: VisibilityProfileOption
}) {
  return (
    isPublicVisibilityProfile(input.visibilityProfile) &&
    (input.noteKind === "reflection" || input.noteKind === "update")
  )
}

export function getNoteVisibilityValidationMessage(input: {
  noteKind: NoteKindOption
  visibilityProfile: VisibilityProfileOption
}) {
  if (!isPublicVisibilityProfile(input.visibilityProfile)) {
    return null
  }

  if (canPublishNoteToShowcase(input)) {
    return null
  }

  return "Only reflection and update notes can be published to the public showcase."
}
