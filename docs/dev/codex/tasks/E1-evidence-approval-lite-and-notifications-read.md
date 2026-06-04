# E1 Evidence, Approval-Lite, and Notifications Read

## Goal

Add the first real control layer on top of achievements: evidence attachments, approval-lite for shared/team achievements, and a simple notifications/read surface. This should make Achievno feel like a system for controlling achievement completion, not just marking items as done.

## Starting context

Current MVP already has:

- Auth with email verification.
- Personal achievements.
- Friends / 1-1 shared achievements.
- Groups / group achievements.
- Challenges.
- Production deploy foundation.
- Evidence storage foundation: local filesystem backend and Cloudflare R2 adapter.

## Hard rules

- Do not modify PostgreSQL schema.
- Do not create Django migrations.
- Do not reset or restore DB.
- Do not commit secrets.
- Do not require R2 credentials for normal tests.
- Do not break existing MVP flows or smoke commands.
- Do not hide API errors behind mocks when NEXT_PUBLIC_USE_MOCKS=false.
- Keep scope demo-oriented.

## Priority 0 — Inspect existing schema/models

Before coding, inspect unmanaged models/tables for:

- evidence_assets
- evidence_links
- approval_policies
- approval_policy_approvers
- approval_requests
- approval_request_approvers
- approval_decisions
- notifications
- owner_contexts
- achievements
- achievement_logs
- group_memberships
- friend_connection_sides

Use existing fields only. If some feature cannot be persisted with current schema, report it and implement the closest safe subset.

## Priority 1 — Evidence attach/read API

Implement evidence support for achievement logs/completion.

Required backend behavior:

- Authenticated user can attach evidence to an achievement they can access.
- Evidence can be:
  - text note
  - external URL
  - uploaded file if existing evidence_assets/evidence_links schema supports it cleanly
- File upload should use the existing storage foundation:
  - local storage by default
  - R2 when EVIDENCE_STORAGE_BACKEND=r2
- Store DB metadata using existing evidence tables.
- List evidence on achievement detail.
- Inaccessible achievement ids return 404.
- Do not expose raw storage credentials.

Suggested endpoints, adapt to existing route style:

```text
GET /api/v1/achievements/{achievement_id}/evidence
POST /api/v1/achievements/{achievement_id}/evidence
```

Accept simple JSON evidence first:

```json
{
  "kind": "link",
  "url": "https://example.com/proof",
  "note_text": "proof note"
}
```

If multipart file upload is feasible, add it. If not, document file upload as pending but keep storage adapter ready.

## Priority 2 — Approval-lite for shared/team achievements

Implement minimal approval request flow for non-personal achievements.

Target contexts:

- friend_connection achievements
- group achievements

Required behavior:

- Completing shared/team achievement should be able to create an approval request instead of silently completing, if current schema supports approval requests.
- Request should include achievement/log/evidence context where feasible.
- Approvers should be relation participant(s) or group owner/member(s), based on existing membership tables.
- Current user can list approval requests relevant to them.
- Current user can approve or reject a request if they are an approver.
- Approval changes request status and records decision where feasible.
- When approved, achievement completion should be reflected clearly.
- When rejected, achievement should remain or return to in_progress/in_review according to existing status rules.

Suggested endpoints:

```text
GET /api/v1/approvals
GET /api/v1/approvals/{approval_request_id}
POST /api/v1/approvals/{approval_request_id}/approve
POST /api/v1/approvals/{approval_request_id}/reject
```

If full workflow is too large, implement approval read/decision for requests created by completion flow and document exact limitations.

## Priority 3 — Frontend evidence UI

Required frontend behavior:

- Achievement detail shows an Evidence section.
- User can add evidence link/note to accessible achievement.
- Evidence list appears after submit/reload.
- For shared/team achievements, completion flow should clearly explain if approval is required.
- Empty state should say evidence is optional but useful for verification.
- No fake evidence when mocks are disabled.

## Priority 4 — Frontend approvals UI

Required frontend behavior:

- Add approvals surface reachable from main screen or notifications area.
- Current user can see pending approval requests.
- User can approve/reject relevant requests.
- Approval result updates UI.
- Achievement detail should show approval status where available.

Suggested route:

```text
/app/approvals
/app/approvals/[id]
```

## Priority 5 — Notifications read surface

Use existing notifications table if feasible.

Required behavior:

- Add notifications read API for current profile.
- Show unread count/list in UI if not already shown.
- Create simple notification rows for approval request/decision only if existing schema makes it safe.
- Do not implement realtime.
- Do not implement complex notification preferences.

Suggested endpoints:

```text
GET /api/v1/notifications
POST /api/v1/notifications/{notification_id}/read
```

If notification mutations are too much, implement read-only list and document mutations as deferred.

## Priority 6 — Tests and smoke

Add tests where practical:

- evidence attach/list authorization
- evidence link/note validation
- approval request list/detail authorization
- approve/reject authorization
- notification list authorization

Add live smoke if feasible:

```bash
python manage.py achievno_smoke_evidence_approvals
```

Smoke should cover:

- create two users
- create shared or group achievement
- attach evidence link/note
- request approval or complete with approval-lite
- approve/reject as another authorized user
- verify status/evidence/notification reads

## Acceptance commands

Run:

```bash
cd app/server && uv run python manage.py check
cd app/server && uv run python manage.py test
cd app/client && npm run build
cd app/client && npm run lint
cd app/client && npx tsc --noEmit
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
```

Run existing live smokes:

```bash
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_auth
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_personal_achievements
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_challenges
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_friends_invites
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_group_invites
```

If added:

```bash
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_evidence_approvals
```

## Manual browser acceptance

Use NEXT_PUBLIC_USE_MOCKS=false.

Verify:

1. Sign in.
2. Open a personal, 1-1, or group achievement detail.
3. Add evidence link/note.
4. Confirm evidence appears after reload.
5. Complete shared/team achievement with evidence.
6. Confirm approval status/request appears if implemented.
7. Sign in as approver user.
8. Approve or reject request.
9. Confirm achievement/request status updates.
10. Open notifications/approvals surface and confirm list is coherent.

## Required final report

Return exactly:

- summary
- changed_files
- commands_run
- evidence_result
- approval_lite_result
- notifications_result
- frontend_result
- tests_and_smoke_result
- manual_browser_result
- commit_hash
- known_gaps
- blockers_if_any

## Commit

Commit and push after checks pass.

Commit message:

```text
feat: add evidence approval lite and notifications read
```
