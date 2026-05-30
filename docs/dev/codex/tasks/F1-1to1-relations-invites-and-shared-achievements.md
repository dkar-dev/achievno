# F1 1-1 Relations, Invites, and Shared Achievements

## Goal

Finalize and harden the 1-1 relations flow for MVP demo: friends/relations, invite form, invite lifecycle, and shared 1-1 achievements. Keep the focus on person-to-person achievement control. Do not replace the intended Invite action on the main screen with personal/challenge shortcuts.

## Starting context

Current MVP status:

- Auth/email verification works.
- Personal achievements work.
- Groups and group achievements work well enough for demo.
- Main screen currently has a wrong change: Codex added 1-1 and personal sections with own challenges instead of the intended Invite button/action. This must be corrected.
- Friends are currently only minimally represented; this task should make them demoable.

## Hard rules

- Do not modify PostgreSQL schema.
- Do not create Django migrations.
- Do not reset/recreate/restore the DB.
- Do not hide API failures behind mocks when `NEXT_PUBLIC_USE_MOCKS=false`.
- Do not break personal achievements, group achievements, challenge flow, auth, or pre-prod smoke.
- Do not add broad redesign.
- Keep changes bounded and demo-oriented.
- Commit and push when all checks pass.

## Product intent

Achievno is a system for controlling personal, 1-1, and team achievements.

The 1-1 flow must support:

- Seeing current relations/friends.
- Inviting a person.
- Accepting/using an invite enough for demo/local testing.
- Opening a real 1-1 relation/detail page.
- Creating shared achievements for that 1-1 relation if the current schema supports an owner context for this.
- Showing shared 1-1 achievements on the relation page.

## Priority 0 — Revert/fix wrong main screen action

Current problem:

- The main screen was changed to show 1-1 and personal sections with own challenges instead of the intended Invite action.

Required behavior:

- Restore or add a clear primary Invite action on `/app/spaces`.
- Do not replace Invite with personal challenge shortcuts.
- `/app/spaces` should still show personal/group/challenge summary coherently, but the 1-1 relation entry point must be Invite/Friends-oriented.
- Main screen actions should route only to implemented screens.
- If a friends/relations page is added, route Invite/Friends there clearly.

## Priority 1 — Inspect current schema/models for relations/invites

Before coding, inspect existing unmanaged models and tables:

- `friend_connections`
- `friend_connection_sides`
- `invites`
- `invite_usages`
- `owner_contexts`
- any existing relation/owner context type fields

Use existing schema only. Do not invent migrations.

## Priority 2 — Backend friends/relations read

Required backend behavior:

- Add or finish authenticated relations/friends API under `/api/v1/friends` or `/api/v1/relations`.
- Current user can list accepted 1-1 relations/friends from existing tables.
- Current user can view a relation/friend detail by real id.
- Inaccessible relation ids return 404.
- Return stable DTOs, not raw DB rows.
- DTO should include enough profile data for display: relation id, other profile id, display name, username if available, status, created/updated dates where available.

## Priority 3 — Invite create and accept/use flow

Required backend behavior:

- Add authenticated invite create endpoint.
- Current user can create a 1-1/friend invite.
- Invite response must include a shareable invite token/code or URL suitable for local demo.
- Add endpoint to fetch invite by token/code if feasible.
- Add endpoint to accept/use invite as authenticated current user.
- Accepting an invite must create or activate a real 1-1 relation/friend connection if existing schema supports it.
- Prevent self-accept if same account/profile uses their own invite.
- Prevent duplicate active relation where possible.
- Return clear errors for invalid/expired/already-used invites.
- If existing schema supports one-time usage through `invite_usages`, use it.
- If schema makes full lifecycle too expensive, implement create + accept with minimum real persisted relation and document exact gap in `docs/dev/MVP_STATUS.md`.

Required frontend behavior:

- Add/finish invite form UI.
- User can create an invite from main screen or friends screen.
- Show generated invite link/code after creation.
- Allow copying invite link/code.
- Add route to open/accept invite link/code, e.g. `/app/invites/[token]` or existing route.
- If not signed in, invite accept route should ask user to sign in first, then continue or tell them to reopen the link.
- After accepting invite, navigate to the real relation/friend detail.

## Priority 4 — 1-1 shared achievements

Required behavior:

- Inspect whether existing `owner_contexts` can represent 1-1 relation ownership.
- If feasible:
  - Add shared 1-1 achievements read/create using existing achievement infrastructure.
  - Relation detail page shows shared achievements.
  - User can create `done` or `progress` achievement for this relation.
  - Shared achievement detail/progress should reuse existing `/app/achievements/[id]` routes where possible.
- If not feasible within current schema/time:
  - Relation detail must show a clear shared achievements empty-state/CTA.
  - Document the limitation in `docs/dev/MVP_STATUS.md`.

## Priority 5 — Frontend friends/relations UX

Required behavior:

- Add or finish friends/relations list page.
- It must not fake accepted friends as real backend state when mocks are disabled.
- It may show suggestions separately as demo suggestions, but accepted relations must come from API.
- Friend/relation detail must be coherent and not a dead placeholder.
- Show loading, empty, error, and success states.
- If there are no friends yet, show Invite CTA.
- Friend names should come from real profile data.

## Priority 6 — Smoke/tests

Add tests where practical:

- friends/relations API auth requirement
- list accepted relations
- create invite
- accept invite
- duplicate/self accept guard if implemented
- relation detail authorization
- shared 1-1 achievement read/create if implemented

Add a smoke command only if low-risk and fast, e.g.:

```bash
python manage.py achievno_smoke_friends_invites
```

Smoke should cover:

- auth setup user A
- auth setup user B
- user A creates invite
- user B accepts invite
- both can see relation
- create shared relation achievement if implemented

## Acceptance commands

Run:

```bash
cd app/server && uv run python manage.py check
cd app/server && uv run python manage.py test
cd app/client && npm run build
cd app/client && npm run lint
cd app/client && npx tsc --noEmit
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
```

If a new smoke command is added, run it against live DB:

```bash
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_friends_invites
```

Then rebuild/restart pre-prod if changed:

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

1. Sign in as user A.
2. `/app/spaces` shows clear Invite/Friends entry point, not a replacement with personal challenge shortcuts.
3. Create invite.
4. Copy invite link/code.
5. Sign out.
6. Sign up/sign in as user B.
7. Open invite link/code.
8. Accept invite.
9. Confirm relation/friend is created.
10. Open relation/friend detail by real id.
11. Create shared 1-1 achievement if implemented.
12. Confirm shared achievement appears on relation/friend detail.
13. Open shared achievement detail.
14. Complete/log progress if implemented.
15. Return to `/app/spaces` and confirm 1-1/friends summary is coherent.

## Required final report

Return exactly:

- summary
- changed_files
- commands_run
- main_screen_invite_result
- friends_relations_result
- invite_flow_result
- shared_1to1_achievements_result
- tests_and_smoke_result
- manual_browser_result
- commit_hash
- known_gaps
- blockers_if_any

## Commit

Commit and push after checks pass.

Commit message:

```text
feat: implement 1to1 relations invites and shared achievements
```
