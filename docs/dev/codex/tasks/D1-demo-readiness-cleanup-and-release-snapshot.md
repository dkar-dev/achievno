# D1 Demo Readiness, Cleanup, and Release Snapshot

## Goal

Turn the current local pre-prod MVP into a clean demo-ready release snapshot. Do not add new product scope unless needed to fix a demo blocker. Focus on hygiene, smoke stability, visible UI/copy polish, final manual acceptance, MVP docs, and a release tag.

## Current MVP scope

Working flows expected before D1:

- email/password auth with SMTP verification
- personal achievements
- challenges
- groups
- group members
- group invites
- group/team achievements
- friends / 1-1 relations
- friend invites
- shared 1-1 achievements
- /app/spaces aggregate
- rootless Podman local pre-prod runtime

## Hard rules

- Do not change database schema.
- Do not create migrations.
- Do not reset or recreate the database.
- Do not commit secrets.
- Do not commit generated cache/build artifacts.
- Do not add OAuth, Telegram auth, production hosting, notifications, approvals/evidence, marketplace, or complex leaderboards.
- Do not do a broad redesign.
- Keep fixes small and tied to demo readiness.
- Commit and push when checks pass.

## Priority 0 — Verify base and clean worktree

Before edits:

- Pull latest main.
- Verify latest G2 commit is present locally and on origin/main.
- Remove local generated noise only: __pycache__, *.pyc, app/client/tsconfig.tsbuildinfo, accidental Next cache/build noise if present.
- Update .gitignore if needed so generated files do not reappear.
- If generated files are tracked, remove only generated artifacts from git tracking with git rm --cached.

Suggested cleanup:

```bash
find app/server -type d -name __pycache__ -prune -exec rm -rf {} +
find app/server -type f -name '*.pyc' -delete
rm -f app/client/tsconfig.tsbuildinfo
```

## Priority 1 — Full command pass

Run and keep green:

```bash
cd app/server && uv run python manage.py check
cd app/server && uv run python manage.py test
cd app/client && npm run build
cd app/client && npm run lint
cd app/client && npx tsc --noEmit
```

Live DB smokes:

```bash
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_check_db
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_check_models
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_auth
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_personal_achievements
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_challenges
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_friends_invites
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_group_invites
```

Pre-prod runtime:

```bash
scripts/preprod/down.sh
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/build.sh
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/up.sh
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
scripts/preprod/status.sh
```

If a smoke fails, fix only that blocker and rerun relevant checks.

## Priority 2 — Browser demo route pass

Use http://127.0.0.1:3000 with NEXT_PUBLIC_USE_MOCKS=false.

Routes to verify:

- /auth/sign-in
- /auth/sign-up
- /auth/verify-email
- /app/spaces
- /app/me
- /app/achievements/create
- /app/challenges
- /app/challenges/create
- /app/groups
- /app/groups/create
- /app/friends

Flows to verify:

1. Sign up or sign in.
2. Create and complete a personal done achievement.
3. Create a personal progress achievement and log progress.
4. Create a challenge and progress/complete it.
5. Create a group.
6. Create and accept a group invite with another user or smoke-supported test users.
7. Confirm group members section shows both users.
8. Create group achievement and open detail/progress.
9. Create and accept friend invite with another user or smoke-supported test users.
10. Confirm relation detail is real.
11. Create shared 1-1 achievement and open detail/progress.
12. Return to /app/spaces and confirm sections/counts/actions are coherent.
13. Logout and confirm protected routes block or redirect.

Fix only obvious blockers or confusing copy/state issues. Do not expand scope.

## Priority 3 — UI/copy polish

Polish visible copy and CTAs only where it improves demo clarity:

- Main screen clearly separates personal, 1-1, group, and challenge sections.
- Invite entry points are obvious.
- Empty states say what to do next.
- Error states do not look like blank screens.
- Group/team achievement copy says achievements are tracked for the group/team when assignee management is not implemented.
- 1-1 shared achievement copy says it is shared with the selected relation.
- Buttons do not route to unimplemented screens.
- Soften placeholders that look like bugs.

## Priority 4 — Documentation update

Update docs/dev/MVP_STATUS.md and README if needed.

MVP_STATUS must include:

- snapshot date
- release tag target: mvp-local-preprod-v0.2.0
- confirmed working flows
- exact run commands
- smoke command list
- manual browser result
- deferred scope
- known gaps and risks
- dependency audit status if still pending

README should point to docs/dev/MVP_STATUS.md and include the shortest local pre-prod startup path.

## Priority 5 — Release tag

After checks pass and docs are updated:

```bash
git tag -a mvp-local-preprod-v0.2.0 -m "Achievno MVP local pre-prod v0.2.0"
git push origin mvp-local-preprod-v0.2.0
```

If the tag exists, do not force-update it. Report and propose mvp-local-preprod-v0.2.1.

## Final acceptance

Required:

```bash
cd app/server && uv run python manage.py check
cd app/server && uv run python manage.py test
cd app/client && npm run build
cd app/client && npm run lint
cd app/client && npx tsc --noEmit
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
```

Final repo hygiene:

```bash
git status --short
```

Expected: no source changes left uncommitted. Local secrets may remain untracked and ignored.

## Required final report

Return exactly:

- summary
- changed_files
- commands_run
- cleanup_result
- smoke_result
- browser_demo_result
- ui_copy_polish_result
- docs_result
- release_tag_result
- commit_hash
- known_gaps
- blockers_if_any

## Commit

Commit and push after checks pass.

Commit message:

```text
chore: finalize demo readiness snapshot
```
