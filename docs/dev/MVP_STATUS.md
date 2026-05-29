# Achievno MVP Status

## Snapshot Date

2026-05-29

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
- Browser MVP smoke passed with `NEXT_PUBLIC_USE_MOCKS=false`.
- Email/password sign-in works with httpOnly cookies.
- `/app/spaces` loads `/api/v1/main` data and does not show demo data when mocks are disabled.
- Refreshing `/app/spaces` keeps the user authenticated.
- `/app/me` supports personal achievement list, create, progress, complete, and archive flows through API data.
- `/app/challenges` supports challenge list, create, detail, progress, and refresh persistence through API data.
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
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/up.sh
scripts/preprod/status.sh
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
```

If the existing PostgreSQL container is reachable only on a named Podman network, also export `PREPROD_PODMAN_NETWORK` and use the PostgreSQL container hostname in `PREPROD_DATABASE_URL`.

## Acceptance Commands

```bash
scripts/preprod/status.sh
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
cd app/server && uv run python manage.py check
cd app/server && uv run python manage.py test
cd app/client && npm run build
cd app/client && npm run lint
cd app/client && npx tsc --noEmit
```

## Browser Smoke Result

Passed on 2026-05-29 against `http://127.0.0.1:3000` with `NEXT_PUBLIC_USE_MOCKS=false`.

Verified flow:

- signed in with a verified local smoke account;
- reached `/app/spaces`;
- confirmed `/app/spaces` loaded `/api/v1/main` data, not demo data;
- refreshed `/app/spaces` and remained authenticated;
- opened `/app/me`;
- created a done achievement;
- created a progress achievement;
- opened achievement detail;
- added progress;
- completed the achievement;
- archived the achievement;
- returned to `/app/spaces` and confirmed personal counts changed from API data;
- opened `/app/challenges`;
- created a challenge;
- opened challenge detail;
- added challenge progress;
- refreshed challenge detail and confirmed progress persisted;
- logged out;
- confirmed `/app/spaces`, `/app/me`, and `/app/challenges` block or redirect after logout;
- simulated broken `/api/v1/main` and confirmed an error state instead of demo fallback;
- confirmed no access or refresh tokens in browser local/session storage.

## Deferred Scope

- Telegram auth.
- Google OAuth2.
- Refresh token rotation.
- Friends/groups product reads beyond current aggregate placeholders.
- Approvals/evidence.
- Notification mutations.
- Public challenge marketplace.
- Complex leaderboards/rewards.
- Cloud hosting deployment.
- Dependency audit remediation.

## Known Gaps And Risks

- Local pre-prod uses Django `runserver` as an MVP-local fallback, not a production WSGI/ASGI server.
- Sign-up in pre-prod does not expose a dev verification token while `DJANGO_DEBUG=false`; browser acceptance used a known verified local smoke account.
- Dependency audit remediation is deferred and should be handled separately.
- Friends/groups are visible in the main aggregate shell but full product read/detail implementation is deferred.
- Notification, approval/evidence, and marketplace flows remain outside this MVP snapshot.

## Linear Issue Status Summary

- ACH-46 B0 frontend auth wiring: Done after M0 browser smoke.
- ACH-47 P0 main aggregate/profile: Done after M0 browser smoke.
- ACH-48 P1 personal achievements: Done after M0 browser smoke.
- ACH-49 C0 minimal challenges: Done after M0 browser smoke.
- ACH-50 A1 local pre-prod Podman runtime: previously completed.
- ACH-51 M0 manual browser smoke and README status: Done after M0 browser smoke.

## Next Recommended Work

1. Implement `P2_FRIENDS_AND_GROUPS_READS` for real friend and group read surfaces.
2. Run `Q0_DEPENDENCY_AUDIT_REMEDIATION` separately from MVP smoke acceptance.
3. Replace MVP-local Django `runserver` with a production WSGI/ASGI runtime when moving beyond local pre-prod.
