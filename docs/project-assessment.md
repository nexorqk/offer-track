# Project Assessment

## Short Verdict

Current level: strong middle- / partially middle.

Why it is already above junior:

- Real product scope instead of a demo.
- Clear domain split by features.
- Auth, database schema, migrations, seed data, and deployment workflow exist.
- There is real test coverage for backend and frontend flows.
- The main jobs workflow is coherent and implemented end to end.

Why it is not middle+ / senior yet:

- The repository is not fully green on engineering gates.
- Some architecture boundaries are already starting to blur.
- Several critical product and production concerns are still missing.
- Quality is uneven across features: jobs are much stronger than settings, companies, contacts, and tasks.

## Evidence Collected

Commands run locally on March 14, 2026:

- `npm test` - passed
- `npm run build` - passed
- `npm run typecheck` - failed
- `npm run lint` - failed

Key observations:

- The project has meaningful coverage: 34 test files, 92 passing tests at the moment of review.
- Deployment workflow exists in `.github/workflows/railway-deploy.yml`.
- Core product flows are implemented around jobs, dashboard, analytics, contacts, tasks, and auth.
- The codebase already contains a useful feature-driven structure under `features/`.

## Current Grade By Area

### Product Scope

Grade: middle

- The app is not a toy CRUD. It has a coherent workflow and usable product shape.
- Jobs are clearly the strongest area: list, kanban, detail page, status changes, notes, interviews, tasks.
- Some areas are still thinner than they look from the route list.

### Frontend Architecture

Grade: middle-

- Good use of App Router, client/server split, TanStack Query, RHF + Zod.
- Strong UI polish and consistent component structure.
- There are oversized components that are already hard to reason about.
- Some React Compiler and lint signals show that the architecture needs another cleanup pass.

### Backend / Domain Modeling

Grade: middle

- The database model is solid for a personal product.
- Drizzle schema, migrations, query layer, and server actions are present.
- There are useful domain constraints, including SQL-level protection.
- However, some important invariants depend on database behavior that is not covered by the current tests.

### Testing Discipline

Grade: middle

- There is real unit and component test coverage.
- Backend and frontend tests are separated cleanly.
- The repository still fails `typecheck` and `lint`, which weakens the value of green tests.
- No end-to-end or smoke coverage is present yet.

### Production Readiness

Grade: below middle+

- Build passes and deploy workflow exists.
- There is no visible observability layer, no health checks, no error boundary strategy, and no smoke verification in CI.
- CI does not currently enforce tests or build before deploy.

## Main Gaps Blocking Middle+ / Senior

### 1. Engineering baseline is not fully green

This is the biggest blocker.

Current concrete issues:

- `typecheck` fails in `features/jobs/components/job-detail-workflow.test.tsx`
- `lint` fails in:
  - `app/(dashboard)/jobs/[id]/_components/job-detail-workflow.tsx`
  - `features/jobs/components/jobs-page-query.tsx`
  - `lib/forms/rhf-zod.ts`

Why this matters:

- A middle+ / senior project should be boringly reliable at the repo level.
- If lint and typecheck are red, the codebase is not truly CI-safe.

### 2. Architecture boundaries are weakening

Examples:

- `app/(dashboard)/jobs/[id]/_components/job-detail-workflow.tsx` is 1116 lines.
- `features/jobs/components/jobs-page-query.tsx` is 678 lines.
- `features/jobs/server/actions.ts` is 568 lines.
- `features/jobs/components/job-detail-page-query.tsx` imports a component from `app/`, which inverts the expected dependency direction.

Why this matters:

- Large mixed-responsibility files increase regression risk.
- Once boundaries blur, new work gets slower and harder to review.

### 3. Read-path duplication exists

The same page data logic is implemented twice:

- Directly in page files such as `app/(dashboard)/jobs/page.tsx` and `app/(dashboard)/tasks/page.tsx`
- Again in server query actions such as `features/jobs/server/query-actions.ts` and `features/tasks/server/query-actions.ts`

Why this matters:

- This increases maintenance cost.
- It already contributes to React Compiler friction in the jobs list query layer.

### 4. Critical domain behavior depends on DB triggers without enough integration coverage

Example:

- Job status history is recorded through the trigger in `drizzle/0003_cold_valkyrie.sql`

Why this matters:

- Unit tests verify application behavior, but they do not prove the trigger is present in a real database.
- If migrations drift or are skipped, a key product feature degrades silently.

### 5. Feature depth is uneven

The jobs flow is strong, but:

- `settings` is still a placeholder
- companies are mostly read-oriented
- contacts are mostly read-oriented
- tasks only expose limited mutation depth

Why this matters:

- A senior-level product feels consistent across bounded contexts, not only in the flagship one.

### 6. Production discipline is still light

Missing or weak areas:

- No e2e or smoke suite
- No explicit health check route
- No visible error boundary strategy for app routes
- No visible observability, tracing, or structured logging
- Deploy workflow does not run tests or build before deploy

## What Already Looks Strong

- Feature-oriented structure is real, not cosmetic.
- Database modeling is thoughtful.
- Auth/session handling is custom but coherent.
- Query keys and form validation conventions are consistent.
- UI quality is above average for an internal or portfolio app.
- Dashboard, analytics, and jobs workflows are connected through shared domain data.

## Priority Plan To Reach Middle+ / Senior

### Phase 1. Restore engineering trust

Goal: make the repository fully green and enforce it.

Steps:

1. Fix `typecheck` and `lint` errors.
2. Keep `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` green together.
3. Update CI so deploy is blocked unless all four pass.

Definition of done:

- Local and CI runs are green on every branch and before deploy.

### Phase 2. Break up oversized modules

Goal: reduce cognitive load and tighten boundaries.

Steps:

1. Move `JobDetailWorkflow` out of `app/` into `features/jobs/components/`.
2. Split `job-detail-workflow.tsx` into smaller panels:
   - contacts panel
   - interviews panel
   - tasks panel
   - notes panel
   - shared workflow form primitives
3. Split `features/jobs/server/actions.ts` by mutation type.
4. Split `jobs-page-query.tsx` into:
   - filters toolbar
   - summary cards
   - shared jobs page shell
   - kanban/table switch surface

Definition of done:

- No core feature file should feel like a mini-project on its own.
- Dependency direction stays `app -> features -> lib`, not the reverse.

### Phase 3. Unify read-path architecture

Goal: reduce duplication and remove ambiguous data-loading patterns.

Steps:

1. Pick one consistent page-data approach:
   - server page loads plus client hydration
   - or dedicated query action wrappers reused by pages and client refresh
2. Remove duplicated data-loading logic from pages and server actions.
3. Simplify query key construction where React Compiler is complaining.

Definition of done:

- Each page has one obvious source of truth for fetching and refreshing data.

### Phase 4. Add integration confidence around the database

Goal: prove that domain invariants work in a real database, not only in mocks.

Steps:

1. Add integration tests against a real test database for:
   - job status history trigger
   - company normalization uniqueness
   - contact scope validation
2. Run migrations in test setup before integration checks.

Definition of done:

- Critical SQL-level business rules are verified outside mocked unit tests.

### Phase 5. Deepen weaker product surfaces

Goal: make the product feel consistently mature.

Steps:

1. Implement real settings instead of a placeholder:
   - profile defaults
   - notification preferences
   - workspace defaults
2. Add create/edit flows for companies and contacts.
3. Expand task management beyond toggle-only behavior.
4. Add empty/error/recovery states for every route, not only loading states.

Definition of done:

- Non-jobs areas no longer feel scaffolded next to a stronger flagship flow.

### Phase 6. Raise production readiness

Goal: make the app operationally safer.

Steps:

1. Add smoke coverage for the deployed app.
2. Add route-level `error.tsx` and `not-found.tsx` handling where appropriate.
3. Add a health endpoint or equivalent runtime check.
4. Introduce structured logging and error reporting.
5. Add a minimal observability baseline for production incidents.

Definition of done:

- The app can fail, be diagnosed, and be validated after deploy without manual guesswork.

## Suggested Order Of Work

Recommended sequence:

1. Fix lint and typecheck.
2. Make CI enforce lint, typecheck, test, and build.
3. Refactor oversized files and correct architecture boundaries.
4. Add DB integration tests.
5. Add e2e/smoke and operational safety.
6. Fill product gaps in weaker areas.

## Final Assessment

If judged today as a repository:

- Stronger than junior
- Legitimately in middle territory
- Not yet middle+ / senior because the engineering bar is not consistently enforced

If the current gaps are fixed, especially repo greenness, boundaries, CI rigor, and production confidence, this project can realistically move into solid middle+ territory. With stronger operational maturity and deeper consistency across all product areas, it can start to present as senior-level work.
