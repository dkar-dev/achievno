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

## Current recovery snapshot

Status date: 2026-05-27.

This repository is currently a frontend-heavy prototype with a minimal FastAPI server stub and a separately prepared PostgreSQL dump. It is not yet a fully integrated MVP.

## Repository status

### Frontend

Path: `app/client`

Current stack:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix UI primitives
- Vercel Analytics

Current frontend state:

- mobile-first UI prototype exists;
- most screens still run on local/mock data;
- authenticated root currently lives at `/app/spaces`;
- root shell already has `Main` and `Groups` surfaces;
- bottom pill navigation exists for Notifications, Discover Groups, Create Group, and Settings;
- friend rows exist under Main;
- group, achievement, challenge, profile, notification, discover, and settings screens exist as navigable surfaces.

Important caveat: frontend route coverage is not the same as finished MVP behavior. Real API integration, persistence, real auth, and final state transitions are still incomplete.

### Backend

Path: `app/server`

Current stack:

- FastAPI
- Pydantic v2
- pydantic-settings
- Uvicorn

Current backend state:

- `/health` endpoint exists;
- `POST /api/v1/telegram/bootstrap` exists;
- Telegram WebApp init data verification helper exists;
- server currently returns Telegram session stub statuses;
- no SQLAlchemy model layer is present;
- no Alembic migration chain is present;
- no PostgreSQL integration is wired into the application;
- no real auth/session lifecycle is implemented beyond the Telegram bootstrap stub.

### Database

Current analyzed source: `achievno_softos_clean_v2_20260522.sql`.

Dump checksum:

```text
sha256: 177ed029f1086078ab2ce5e89eedec9c87d3e61a4a58c3a900d1c12d92714c12
```

The dump is a PostgreSQL logical schema/data dump with a non-trivial MVP-oriented schema.

Detected objects:

- 33 tables;
- 21 enum types;
- 10 views;
- 29 SQL/PLpgSQL functions;
- 19 triggers;
- 112 indexes;
- 107 `ALTER TABLE ... ADD CONSTRAINT` constraints;
- 76 inline check constraints;
- 89 seed/demo rows across the dump.

Implemented database areas:

- accounts and linked auth methods;
- auth sessions and verification tokens;
- user profiles and preferences;
- taxonomy categories and ranks;
- owner contexts for personal, friend, and group ownership;
- groups and group memberships;
- friend connections with per-side removal state;
- invites and invite usages;
- achievements, assignees, logs, approvals, and evidence metadata;
- challenges, participants, progress, winner/completion history;
- comments;
- notifications;
- outbox events;
- reporting/read-model views.

Database readiness assessment:

- schema shape is strong enough to serve as the current database baseline;
- demo data exists and can exercise core social/product flows;
- functions/triggers/views satisfy the coursework-style requirement for database-side artifacts;
- the dump is not yet converted into application migrations;
- the dump is not yet represented by SQLAlchemy models;
- the FastAPI backend does not currently use this database;
- there are no `CREATE ROLE`, `GRANT`, row-level-security, or policy statements inside the dump. Any roles visible in a local DB tool are cluster/environment-level state, not part of this dump.

## Contract status

`achievno_mvp_delivery_contract_v1_2.yaml` exists and records the older full MVP target. Treat it as a historical source of decisions, not as the final 24-hour execution contract.

The current 24-hour MVP contract still needs to be cut down and written explicitly before implementation continues.

## Current project reality

Achievno currently consists of three partially disconnected assets:

1. a broad mobile-first frontend prototype;
2. a minimal FastAPI/Telegram bootstrap server;
3. a serious PostgreSQL dump that is not yet wired into the server.

Therefore the next work must not start with new screens. The next work must align the database dump, server API, and frontend mock payloads into one vertical MVP slice.

## 24-hour MVP direction to confirm

The likely MVP cut should prioritize one coherent vertical loop:

1. account/profile bootstrap;
2. main screen payload;
3. personal achievements list/detail/create/progress/complete;
4. friend relation list/detail with invite or restore stub where needed;
5. group list/detail with memberships;
6. one challenge path;
7. notifications/read models;
8. Telegram bootstrap compatibility kept as a thin platform entry layer.

Anything outside this loop should be treated as demo-only, stubbed, or deferred until after the first integrated MVP passes smoke testing.

## Immediate engineering priorities

1. Add deterministic local dev startup for client, server, and PostgreSQL.
2. Restore or convert the SQL dump into a committed database bootstrap/migration path.
3. Add server database settings and async SQLAlchemy/asyncpg connectivity.
4. Build minimal model/repository/service layers around the existing schema.
5. Implement aggregated read endpoints for the current frontend surfaces.
6. Replace frontend mock data with API adapters gradually, starting from Main and Personal achievements.
7. Add smoke tests for DB restore, server health, Telegram bootstrap, and one integrated achievement flow.
8. Freeze a smaller 24-hour MVP YAML contract before broader implementation resumes.
