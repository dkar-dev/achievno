# Achievno MVP Status

## Snapshot Date

2026-06-03

Release tag target: `mvp-local-preprod-v0.2.0`

## What Works

- Local pre-prod runtime starts the Django API and Next.js client with rootless Podman.
- PostgreSQL remains external; the runtime does not create, reset, restore, stop, remove, or migrate the database container.
- Backend health endpoints pass: `/health` and `/health/db`.
- Backend smoke commands pass inside the API container:
  - `achievno_check_db`
  - `achievno_check_models`
  - `achievno_smoke_auth`
  - `achievno_smoke_personal_achievements`
  - `achievno_smoke_challenges`
- Host-side live DB smoke commands also pass for:
  - `achievno_smoke_friends_invites`
  - `achievno_smoke_group_invites`
- Browser MVP demo pass passed with `NEXT_PUBLIC_USE_MOCKS=false`.
- Email/password sign-in works with httpOnly cookies.
- `/app/spaces` loads `/api/v1/main` data and does not show demo data when mocks are disabled.
- Refreshing `/app/spaces` keeps the user authenticated.
- `/app/me` supports personal achievement list, create, progress, complete, and archive flows through API data.
- `/app/challenges` supports challenge list, create, detail, progress, and refresh persistence through API data.
- `/app/groups` supports real group create/detail, invite creation, invite acceptance, member listing, and group/team achievements through API data.
- `/app/friends` supports real friend invite creation, invite acceptance, relation detail, and shared 1-on-1 achievements through API data.
- Logout clears the authenticated browser session; `/app/spaces`, `/app/me`, and `/app/challenges` block or redirect after logout.
- Broken main API access shows an error state instead of silently falling back to demo data.
- Browser `localStorage` and `sessionStorage` do not contain access or refresh tokens.

## How To Run Local Pre-Prod

```bash
cp .env.preprod.example .env.preprod.local
set -a
. ./.env.preprod.local
set +a

PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/build.sh
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/up.sh
scripts/preprod/status.sh
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
```

If the existing PostgreSQL container is reachable only on a named Podman network, also export `PREPROD_PODMAN_NETWORK` and use the PostgreSQL container hostname in `PREPROD_DATABASE_URL`.

## Acceptance Commands

```bash
cd app/server && uv run python manage.py check
cd app/server && uv run python manage.py test
cd app/client && npm run build
cd app/client && npm run lint
cd app/client && npx tsc --noEmit
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
```

## Smoke Command List

```bash
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_check_db
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_check_models
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_auth
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_personal_achievements
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_challenges
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_friends_invites
cd app/server && DATABASE_URL="$PREPROD_DATABASE_URL" uv run python manage.py achievno_smoke_group_invites
scripts/preprod/down.sh
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/build.sh
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/up.sh
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
scripts/preprod/status.sh
```

For host-side management commands, replace the database hostname with `127.0.0.1` when `.env.preprod.local` uses a Podman-network hostname such as `softos-postgres`.

## Browser Demo Result

Passed on 2026-06-03 against `http://127.0.0.1:3000` with `NEXT_PUBLIC_USE_MOCKS=false`.

Verified flow:

- opened `/auth/sign-in`, `/auth/sign-up`, and `/auth/verify-email`;
- signed up two browser demo users and verified them through the existing email auth method records;
- signed in with browser cookies;
- opened `/app/spaces`, `/app/me`, `/app/achievements/create`, `/app/challenges`, `/app/challenges/create`, `/app/groups`, `/app/groups/create`, and `/app/friends`;
- opened `/app/me`;
- created and completed a personal done achievement;
- created a personal progress achievement;
- opened achievement detail;
- created a challenge;
- added challenge progress and completed it;
- created a group;
- created and accepted a group invite with another user;
- confirmed group detail shows both active members;
- created a group/team achievement and opened its progress route;
- created and accepted a friend invite with another user;
- confirmed the friend relation detail is real;
- created a shared 1-on-1 achievement and opened its progress route;
- returned to `/app/spaces` and confirmed personal, friends, groups, and challenges sections are coherent;
- logged out;
- confirmed `/app/spaces` blocks or redirects after logout;
- confirmed no access or refresh tokens in browser local/session storage.

## Deferred Scope

- Telegram auth.
- Google OAuth2.
- Refresh token rotation.
- Approvals/evidence.
- Notification mutations.
- Public challenge marketplace.
- Complex leaderboards/rewards.
- Cloud hosting deployment.
- Dependency audit remediation.

## Known Gaps And Risks

- Local pre-prod uses Django `runserver` as an MVP-local fallback, not a production WSGI/ASGI server.
- Sign-up in pre-prod does not expose a dev verification token while `DJANGO_DEBUG=false`; browser acceptance verified demo users through existing email auth method records.
- Dependency audit remediation is deferred and should be handled separately.
- Notification, approval/evidence, and marketplace flows remain outside this MVP snapshot.

## Linear Issue Status Summary

- ACH-46 B0 frontend auth wiring: Done after M0 browser smoke.
- ACH-47 P0 main aggregate/profile: Done after M0 browser smoke.
- ACH-48 P1 personal achievements: Done after M0 browser smoke.
- ACH-49 C0 minimal challenges: Done after M0 browser smoke.
- ACH-50 A1 local pre-prod Podman runtime: previously completed.
- ACH-51 M0 manual browser smoke and README status: Done after M0 browser smoke.
- G2 group members, invites, and team achievement polish: Done before D1 snapshot.
- F1 1-to-1 relations, invites, and shared achievements: Done before D1 snapshot.

## Next Recommended Work

1. Run `Q0_DEPENDENCY_AUDIT_REMEDIATION` separately from MVP smoke acceptance.
2. Replace MVP-local Django `runserver` with a production WSGI/ASGI runtime when moving beyond local pre-prod.
3. Plan approvals/evidence and notification mutations as post-MVP product increments.
