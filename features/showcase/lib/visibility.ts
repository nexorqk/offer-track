export const visibilityProfileOptions = [
  "private",
  "shared",
  "public_showcase",
] as const

export type VisibilityProfileOption =
  (typeof visibilityProfileOptions)[number]

export const noteKindOptions = [
  "internal",
  "reflection",
  "update",
] as const

export type NoteKindOption = (typeof noteKindOptions)[number]

export const publicNoteKindOptions = noteKindOptions.filter(
  (value): value is Extract<NoteKindOption, "reflection" | "update"> =>
    value !== "internal",
)
