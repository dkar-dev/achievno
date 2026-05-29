# Achievno

Achievno is a mobile-first social achievement tracker for personal progress, 1-on-1 friend achievements, and group progress. The intended product surface targets mobile web first and Telegram Mini App compatibility second.

## Local Pre-Prod Runtime

The local pre-prod runtime uses rootless Podman for the Django API and Next.js client. PostgreSQL remains an external dependency: these scripts do not create, reset, restore, stop, remove, or migrate the database container.

Use `PREPROD_DATABASE_URL` for the container database connection. If the existing PostgreSQL container publishes port `5432` on the host, containers usually need `host.containers.internal` instead of `127.0.0.1`. If the database is reachable only on an existing named Podman network, export `PREPROD_PODMAN_NETWORK` and use the database container hostname in `PREPROD_DATABASE_URL`; the runtime does not create or modify that network.

```bash
cp .env.preprod.example .env.preprod.local
set -a
. ./.env.preprod.local
set +a

PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/build.sh
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/up.sh
scripts/preprod/status.sh
PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
scripts/preprod/logs.sh
scripts/preprod/down.sh
```

Images:

- `localhost/achievno-api:preprod`
- `localhost/achievno-client:preprod`

Containers:

- `achievno-preprod-api` on `http://127.0.0.1:8000`
- `achievno-preprod-client` on `http://127.0.0.1:3000`

The backend container starts with `DJANGO_DEBUG=false`, allows `localhost`, `127.0.0.1`, `achievno-preprod-api`, and `testserver` for in-container DRF smoke commands, and supports credentialed CORS from `http://127.0.0.1:3000` and `http://localhost:3000`. It uses Django `runserver` as the MVP-local runtime fallback to avoid adding server dependencies in this contract, and it does not run migrations automatically. The frontend build defaults to `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` and `NEXT_PUBLIC_USE_MOCKS=false`.

## Current MVP Snapshot

Status date: 2026-05-29.

Achievno is currently a local pre-prod MVP, not a hosted cloud deployment. The working stack is:

- Next.js client in `app/client`;
- Django + Django REST Framework backend in `app/server`;
- unmanaged Django models over the existing PostgreSQL schema;
- existing PostgreSQL as an external dependency;
- rootless Podman runtime for the API and client containers.

Browser-verified MVP surfaces:

- email/password sign-in with httpOnly access and refresh cookies;
- authenticated `/app/spaces` main aggregate loaded from `/api/v1/main`;
- refresh of `/app/spaces` keeps the user authenticated;
- personal achievements list, create, detail, progress, complete, and archive flows;
- `/app/spaces` personal counts update from API data after achievement changes;
- challenges list, create, detail, progress, refresh persistence, and protected access;
- logout clears the authenticated browser session and protected MVP routes block or redirect;
- with mocks disabled, broken API access shows an error state instead of demo data;
- browser `localStorage` and `sessionStorage` do not contain access or refresh tokens.

Deferred scope remains tracked in [docs/dev/MVP_STATUS.md](docs/dev/MVP_STATUS.md). The MVP still excludes cloud hosting, Telegram auth, Google OAuth2, refresh rotation, friends/groups product reads, approvals/evidence workflows, notification mutations, public challenge marketplace, and advanced leaderboard/reward systems.
