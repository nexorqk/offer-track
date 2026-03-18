# Public Showcase Design

Date: 2026-03-18
Status: Approved for planning
Product area: Public showcase and visibility model

## Context

Offer Track already covers the private job-search workspace: auth, dashboard, jobs pipeline, companies, contacts, tasks, notes, and analytics. The next product-level complexity should not be another CRUD surface inside the dashboard. It should add a second mode of use.

During brainstorming, the chosen direction was:

- Product growth area: collaboration and sharing
- Scope: public read-only sharing, not multi-user editing
- Audience: public portfolio-style link
- Visibility model: preset profiles rather than field-by-field publishing
- Primary outcome: content and reflection, not just static reporting
- Public scope in v1: jobs and reflection-style notes only
- Visual stance: public showcase should be visually distinct from the private dashboard

## Problem

The private workspace is useful for operating a job search, but it has no structured way to publish a curated public-facing version of that process. Users who want to share progress, selected opportunities, and reflections still have to manually copy information into external posts or documents.

If public sharing is added naively, the risk is high:

- privacy rules leak across the product
- raw private entities get rendered publicly by accident
- publishing becomes tedious and hard to trust

The feature needs to make public sharing possible without weakening the private workspace model.

## Goals

- Add a public read-only showcase mode on top of the existing private workspace
- Let users publish selected jobs and reflection/update notes through preset visibility profiles
- Keep publishing simple enough to use regularly
- Make the public surface safe by construction through whitelisted projections
- Keep the public showcase visually distinct from the private dashboard shell

## Non-Goals

- No multi-user editing, comments, reactions, or public collaboration in v1
- No public contacts, interviews, tasks, or internal notes
- No field-by-field custom ACL builder
- No public write actions or anonymous submissions
- No requirement to add dedicated public note detail pages in v1

## Chosen Direction

The selected direction is a separate `public showcase` product layer, not a read-only dashboard clone.

Why this direction:

- It adds a meaningful second mode to the product: private operating system plus public journal/showcase
- It fits the user goal of sharing reflection and progress publicly
- It creates clear architectural boundaries for privacy and rendering
- It avoids scattering public/private conditionals across every existing feature

## Product Model

The private workspace remains the source of truth. The public showcase renders only a safe projection of published data.

Core behavior:

- Each user can enable a public showcase with a unique slug
- Jobs can be marked with a visibility profile
- Notes can be published only when they are reflection/update notes
- Public pages read projection models only, never raw private entities
- If a showcase is disabled, it behaves as nonexistent to the public

## Visibility Model

Visibility profiles:

- `private`
- `shared`
- `public_showcase`

Behavior in v1:

- `private`: visible only inside the authenticated workspace
- `shared`: reserved for future non-public sharing flows, behaves like private for now
- `public_showcase`: eligible for rendering in the public showcase through the public projection layer

Rules:

- Jobs may be published to showcase
- Notes may be published only when `note_kind` is `reflection` or `update`
- Contacts, interviews, tasks, and ordinary internal notes never participate in the public layer

## Data Model

Proposed schema additions:

### Profiles

- `showcase_enabled`
- `showcase_slug`
- `showcase_title`
- `showcase_intro`
- `showcase_bio`

### Jobs

- `visibility_profile`
- `public_id`
- `public_summary`

### Notes

- `visibility_profile`
- `note_kind`

`note_kind` should support at least:

- `internal`
- `reflection`
- `update`

`public_id` must be distinct from the internal job id so public URLs do not expose internal identifiers.

## Public Projection Rules

The public layer should expose only whitelisted fields.

### Jobs

Allowed:

- role title
- company name
- current stage/status
- work mode
- location
- source
- applied date
- public summary
- selected public tags if introduced later

Excluded:

- contacts
- internal notes
- salary expectations and private compensation context
- private links and service metadata
- internal foreign-key structure beyond what the projection needs

### Notes

Allowed:

- reflection/update content
- title if present
- created/published timestamp
- linked public job summary when applicable

Excluded:

- internal note content
- workflow annotations intended only for private workspace use

## Architecture

This feature should be implemented as a distinct feature slice, not as conditional rendering inside existing dashboard queries.

Expected structure:

- `app/showcase/[slug]/page.tsx`
- `app/showcase/[slug]/jobs/[publicId]/page.tsx`
- dashboard settings surface for showcase configuration
- `features/showcase/components`
- `features/showcase/server`
- `features/showcase/schemas`
- `features/showcase/types`

Boundary rules:

- `features/jobs/server` and `features/notes/server` continue to own private domain behavior
- `features/showcase/server` owns public reads and showcase settings flows
- public pages consume `Public*ViewModel` types only
- visibility decisions live in one policy module, not in page components

## Server Contracts

Expected mutations:

- `updateShowcaseSettingsAction`
- `updateJobVisibilityAction`
- `updateNoteVisibilityAction`

Expected public queries:

- `getPublicShowcaseBySlug(slug)`
- `getPublicShowcaseJob(slug, publicId)`
- `listPublicShowcaseReflections(slug)`

Expected policy module:

- `features/showcase/server/visibility-policy.ts`

The policy module should centralize:

- which entity types can be public
- which note kinds are public-eligible
- which fields are serialized into the public layer
- which invalid publish transitions should be rejected

## Routes And UX

Private surfaces:

- showcase controls in dashboard settings: enable toggle, slug, title, intro, bio, public link, preview
- job detail or job form controls: visibility profile, public summary, public state indicator
- notes controls: note kind plus visibility profile

Public surfaces:

- `/showcase/[slug]`: profile hero, intro, selected jobs, recent reflections, public analytics snapshot
- `/showcase/[slug]/jobs/[publicId]`: public job detail with safe fields and related public reflections

Preview requirement:

- the owner should be able to preview the showcase before public launch
- preview must use the same projection and rendering path as the public routes
- preview cannot bypass the public serializer rules

## Visual Direction

The showcase should not inherit the private dashboard shell verbatim.

Design intent:

- private dashboard keeps the stronger warm operational shell
- public showcase becomes lighter, cleaner, and more editorial
- both surfaces still feel like the same product family
- public pages should feel presentational, not tool-like

## Error Handling And Security

Required behavior:

- disabled showcase returns `404`
- unknown slug returns `404`
- unpublished or private public job route returns `404`
- slug conflicts return form validation errors
- invalid attempts to publish unsupported note kinds are rejected server-side

Security principles:

- public pages never render raw private entities
- only public view models cross into showcase UI
- no public serializers exist for contacts, tasks, or interviews in v1
- preview uses the same projection path as public routes

## Testing

Backend coverage should validate:

- visibility policy rules
- slug uniqueness
- showcase-disabled behavior
- public queries excluding private entities
- direct access to private jobs returning not found
- internal notes never surfacing in public responses

Frontend coverage should validate:

- showcase settings form state and validation
- job visibility controls and public summary handling
- note kind plus visibility interactions
- public pages rendering only allowed blocks
- preview matching public rendering semantics

Per project convention for backend functionality:

- write backend tests before implementation
- after implementation, run both backend and frontend test suites

## Risks

- accidental leakage of private fields into public pages
- confusing UX between internal notes and public reflections
- public publishing controls becoming too heavy for regular use
- architectural drift if showcase logic leaks back into feature pages

## Risk Mitigations

- enforce projection-based public reads only
- centralize policy decisions in one module
- keep v1 entity scope narrow: jobs plus reflection/update notes
- use preview on the same projection path before publishing
- avoid field-level publishing complexity in the first version

## Acceptance Criteria

The design is successful if all of the following are true:

- A user can enable a public showcase with a unique slug
- A user can publish selected jobs and reflection/update notes
- Public pages reveal only whitelisted data
- Private jobs and private notes are unreachable from the public layer
- Showcase preview matches eventual public output
- The public experience feels intentionally separate from the private dashboard
- Backend and frontend tests pass after implementation

## Implementation Notes For Planning

- Keep public view models explicit and small
- Prefer adding a focused `features/showcase` slice over touching every feature route
- Add preview early because it validates both UX and privacy semantics
- Keep `shared` in the schema now even if the first UI does not expose it deeply
- Start with home page plus public job detail page; public note detail pages can wait
