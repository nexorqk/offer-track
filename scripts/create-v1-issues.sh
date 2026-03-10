#!/usr/bin/env bash

set -euo pipefail

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

ensure_repo_access() {
  require_command gh

  if ! gh auth status >/dev/null 2>&1; then
    echo "GitHub CLI is not authenticated. Run: gh auth login" >&2
    exit 1
  fi

  if ! gh repo view >/dev/null 2>&1; then
    echo "GitHub CLI is not pointed at a repository. Run this script from the repo root." >&2
    exit 1
  fi
}

ensure_label() {
  local name="$1"
  local color="$2"
  local description="$3"

  if gh label view "$name" >/dev/null 2>&1; then
    gh label edit "$name" --color "$color" --description "$description" >/dev/null
  else
    gh label create "$name" --color "$color" --description "$description" >/dev/null
  fi
}

create_issue() {
  local title="$1"
  local labels_csv="$2"
  local body="$3"
  local args=()

  IFS=',' read -r -a labels <<< "$labels_csv"

  for label in "${labels[@]}"; do
    args+=(--label "$label")
  done

  gh issue create --title "$title" "${args[@]}" --body "$body"
}

main() {
  ensure_repo_access

  ensure_label "v1" "1D76DB" "Required for v1"
  ensure_label "jobs" "0052CC" "Jobs domain"
  ensure_label "tasks" "0E8A16" "Tasks domain"
  ensure_label "companies" "5319E7" "Companies domain"
  ensure_label "contacts" "FBCA04" "Contacts domain"
  ensure_label "dashboard" "C2E0C6" "Dashboard domain"
  ensure_label "analytics" "BFD4F2" "Analytics domain"
  ensure_label "backend" "D93F0B" "Backend work"
  ensure_label "frontend" "A2EEEF" "Frontend work"
  ensure_label "architecture" "6E7781" "Architecture work"
  ensure_label "tanstack-query" "0F766E" "TanStack Query"
  ensure_label "forms" "BF8700" "Forms work"
  ensure_label "react-hook-form" "EC4899" "React Hook Form"
  ensure_label "zod" "7C3AED" "Zod validation"

  create_issue "JD-01 Interviews on Job Details" "v1,jobs,backend,frontend" "$(cat <<'EOF'
## Description
Add interviews to job details.

## Acceptance Criteria
- Interviews are loaded with the job details data.
- Job details page has an Interviews section.
- User can create an interview with type, scheduledAt, durationMinutes, location, result, and notes.
- Backend and frontend tests pass.
EOF
)"

  create_issue "TS-01 Tasks Page MVP" "v1,tasks,backend,frontend" "$(cat <<'EOF'
## Description
Replace the tasks placeholder with a working tasks page.

## Acceptance Criteria
- Tasks page shows title, due date, completion status, and linked job.
- Filters exist for open, completed, and overdue tasks.
- User can mark a task complete and reopen it.
- Backend and frontend tests pass.
EOF
)"

  create_issue "CO-01 Companies Page MVP" "v1,companies,backend,frontend" "$(cat <<'EOF'
## Description
Replace the companies placeholder with a real companies page.

## Acceptance Criteria
- Companies page lists companies.
- Each company shows jobs count.
- Each company shows a stage summary.
- User can navigate to jobs for a company.
- Backend and frontend tests pass.
EOF
)"

  create_issue "CT-01 Contacts Page MVP" "v1,contacts,backend,frontend" "$(cat <<'EOF'
## Description
Replace the contacts placeholder with a real contacts page.

## Acceptance Criteria
- Contacts page shows name, role, email, LinkedIn, company, and notes.
- User can navigate to related company.
- User can navigate to related job when available.
- Backend and frontend tests pass.
EOF
)"

  create_issue "JB-01 Real Jobs Table" "v1,jobs,frontend" "$(cat <<'EOF'
## Description
Implement a real table mode on the jobs page.

## Acceptance Criteria
- Jobs page has a true table view.
- Table supports search, filters, sort, and pagination.
- Table supports column selection.
- View and filters stay in URL state.
- Backend and frontend tests pass.
EOF
)"

  create_issue "DB-01 Dashboard v1 Metrics" "v1,dashboard,backend,frontend" "$(cat <<'EOF'
## Description
Align dashboard summary cards with v1.

## Acceptance Criteria
- Dashboard cards show total jobs, active applications, interviews, and offers.
- Overdue follow ups remain visible.
- Recent activity remains visible.
- Backend and frontend tests pass.
EOF
)"

  create_issue "AN-01 Analytics v1 Metrics" "v1,analytics,backend,frontend" "$(cat <<'EOF'
## Description
Add the missing analytics metrics required for v1.

## Acceptance Criteria
- Analytics shows interview rate.
- Analytics shows rejection count.
- Funnel and applications by source remain available.
- Backend and frontend tests pass.
EOF
)"

  create_issue "AR-01 TanStack Query Alignment" "architecture,tanstack-query,frontend" "$(cat <<'EOF'
## Description
Align data fetching with the TanStack Query rules from AGENTS.md.

## Acceptance Criteria
- Jobs list, single job, companies, contacts, tasks, and analytics data use TanStack Query.
- Loading and error states are explicit.
- Cache invalidation after mutations is defined.
- Frontend tests pass.
EOF
)"

  create_issue "FM-01 Forms Alignment" "architecture,forms,react-hook-form,zod" "$(cat <<'EOF'
## Description
Standardize forms on React Hook Form and Zod.

## Acceptance Criteria
- Job, company, contact, interview, and task forms use RHF + Zod consistently.
- Validation errors are visible in UI.
- Client and server validation rules stay aligned.
- Backend and frontend tests pass.
EOF
)"
}

main "$@"
