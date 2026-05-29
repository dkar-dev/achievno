# H1 MVP Core Entity and UI Fix Pass

## Goal

Stabilize the current MVP for manual demo by fixing the remaining visible core-flow problems in one pass. Focus on achievements first, then groups and friends. Do **not** touch the profile page or profile display issue in this task.

## Starting context

Current local MVP already has:

- Django + DRF backend.
- External PostgreSQL through `DATABASE_URL` / `PREPROD_DATABASE_URL`.
- Cookie auth and real SMTP email verification.
- Next.js frontend.
- Personal achievements API/UI.
- Challenges API/UI.
- Podman local pre-prod runtime.

Recent connector commits already attempted part of the achievement fix. Start by pulling latest `main`, inspecting those changes, and validating them before adding more code.

## Hard rules

- Do not modify the profile screen or profile data binding in this task.
- Do not implement profile fixes, even though `/app/profile` currently shows Alex Johnson.
- Do not create Django migrations.
- Do not modify PostgreSQL schema.
- Do not reset, recreate, or restore the DB.
- Do not hide broken API paths behind mocks when `NEXT_PUBLIC_USE_MOCKS=false`.
- Do not do a large redesign.
- Keep fixes small, direct, and demo-oriented.
- Preserve all existing auth, achievement, challenge, and pre-prod smoke commands.
- Commit and push when all checks pass.

## Priority 1 — Finish and verify achievements

Fix and verify the complete personal achievements flow.

### Create achievement

Required behavior:

- Date picker must work in browser.
- Deadline date is optional.
- Deadline time is optional.
- If only date is selected, use local `23:59` for `deadline_at`.
- If no date is selected, send `deadline_at: null`.
- `short name` / `short_definition` is optional.
- Creating a `done` achievement should work with only `title` filled.
- Creating a `progress` achievement should work with `title` + positive `target`.
- `progress_target` must not be required for `done` achievements.

### Achievement detail

Current bug: after creating an achievement, detail can show an almost empty screen with only bottom buttons.

Required behavior:

- Detail page must always render useful content for both `done` and `progress` achievements.
- Show title.
- Show description or short definition when available.
- Show achievement type: `Done` or `Progress`.
- Show status.
- Show deadline or `No deadline`.
- Show recent logs section.
- If no logs exist, show a clear empty-state message.
- After completion/progress, recent logs must appear after refresh/reload.
- Avoid runtime crashes when optional fields are `null`.

### Done achievement behavior

Required behavior:

- `done` achievements must not show `Log progress`.
- `done` achievements should have exactly one primary unfinished action: `Done`.
- Pressing `Done` should call the complete endpoint.
- After completion, status/logs/detail should update.
- After completion, archive should be available.

### Progress achievement behavior

Required behavior:

- `progress` achievements should show progress current/target/unit.
- `progress` achievements should show `Log progress`.
- `progress` achievements may also show `Complete` if supported.
- Progress logging should update detail and logs.

### Backend achievement validation

Required behavior:

- Backend accepts missing/blank/null `short_definition` and stores a safe value if the DB column requires non-null.
- Backend accepts null `deadline_at`.
- Backend returns stable DTOs where optional fields may be null.
- Existing tests and smoke commands stay green.

## Priority 2 — Main screen coherence

Fix `/app/spaces` so it matches implemented backend flows and does not point users into broken placeholders.

Required behavior:

- Cards/actions on `/app/spaces` should route to implemented screens only.
- Personal achievement card/action routes to `/app/me` or `/app/achievements/create` correctly.
- Challenges card/action routes to `/app/challenges` or `/app/challenges/create` correctly.
- Counts should come from API when `NEXT_PUBLIC_USE_MOCKS=false`.
- Do not silently show demo data when API fails.
- Show clear empty/error states.

## Priority 3 — Groups read/create/join minimal real flow

The app is positioned as a system for controlling team achievements. It cannot be demoed if groups are pure fake/broken UI. Implement the smallest real group flow supported by the current schema.

Inspect current unmanaged models/schema before coding. Use existing group tables only. Do not change schema.

Required backend behavior:

- Add or finish authenticated groups API under `/api/v1/groups` if not already present.
- Current user can list groups they belong to.
- Current user can create a group.
- Current user becomes owner/member of the created group.
- Current user can view group detail by real `group_id`.
- Current user can join a discover/demo group in a way that creates a real membership or real group+membership record in DB.
- If discover groups are mock templates, joining one must materialize a real group/membership and route to that real group id.
- Joining any group must not hard-route to the fixed `dev team` group.
- Inaccessible groups return 404.
- Return stable DTOs, not raw DB rows.

Required frontend behavior:

- `/app/groups` or the current groups entry route must show real joined groups when `NEXT_PUBLIC_USE_MOCKS=false`.
- `/app/groups/create` or current create group UI must create a real group.
- `/app/groups/[id]` must load the real group by route id.
- Discover groups may show 2–3 mock/demo group templates, but the join action must create/join a real group and navigate to the real group detail.
- No route may redirect every group to Dev Team.
- Loading, empty, error, and success states must be clear.

## Priority 4 — Group/team achievements minimal flow

Team achievements are central. Implement the smallest version using existing `owner_contexts` + `achievements` schema.

Required behavior:

- On group detail, show group/team achievements for that group if backend/schema supports group owner context achievements.
- Allow creating a group achievement from a group page if feasible within current structure.
- Group achievement can be `done` or `progress`.
- Detail/log/progress behavior should reuse or mirror personal achievement behavior.
- If full group achievement writes are too large, implement at minimum group achievement read + clear CTA/empty-state and document the write gap in `docs/dev/MVP_STATUS.md`.

Do not break personal achievements while adding group achievements.

## Priority 5 — Friends minimal read/display

Friends can remain partially mocked for this cut, but the UI must not look broken.

Required behavior:

- Display a friends section/page/card that is coherent.
- Prefer real friends read from existing `friend_connections` / `friend_connection_sides` if current schema and models are available.
- If real friend creation is too large, keep friend suggestions mocked, clearly separated from accepted friends.
- Do not fake accepted friendships as real backend state unless actually persisted.
- Friend UI must not block the core demo.

## Acceptance commands

Run these from repo root unless path says otherwise:

```bash
scripts/preprod/status.sh
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
cd app/server && uv run python manage.py check
cd app/server && uv run python manage.py test
cd app/client && npm run build
cd app/client && npm run lint
cd app/client && npx tsc --noEmit
```

Then rebuild/restart local pre-prod if frontend/backend changed:

```bash
cd ~/workspace/achievno
set -a
. ./.env.preprod.local
set +a
scripts/preprod/down.sh
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/build.sh
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/up.sh
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
```

## Manual browser acceptance

Use `http://127.0.0.1:3000` with `NEXT_PUBLIC_USE_MOCKS=false`.

Verify:

1. Sign in or sign up through real email verification.
2. Create `done` achievement with only title.
3. Confirm detail page is not blank.
4. Confirm `done` achievement shows `Done`, not `Log progress`.
5. Complete it and confirm logs appear.
6. Create `progress` achievement with title + target.
7. Log progress and confirm logs/progress update.
8. Confirm deadline date picker works and time is optional.
9. Open `/app/spaces` and confirm counts/actions are coherent.
10. Create a group.
11. Open the created group detail by its real id.
12. Join one discover/demo group and confirm it does not route to fixed Dev Team unless that is the actual joined group.
13. Confirm joined groups list includes real joined/created groups.
14. Confirm friends UI is coherent and not blocking.
15. Logout and confirm protected routes block/redirect.

## Required final report

Return exactly:

- summary
- changed_files
- commands_run
- achievements_result
- spaces_result
- groups_result
- group_achievements_result
- friends_result
- manual_browser_result
- commit_hash
- known_gaps
- blockers_if_any

## Commit

Commit and push after checks pass.

Commit message:

```text
fix: harden mvp core entity flows
```
