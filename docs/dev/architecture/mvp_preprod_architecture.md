# Achievno MVP pre-prod architecture

## Decision

The 24h MVP pre-prod environment runs locally with Podman rootless.

The PostgreSQL database already exists as a running Podman container and is treated as an external dependency.

## Runtime components

```text
Browser
  -> Next.js client container
  -> Django API container
  -> existing PostgreSQL container
```

The Django API server does not create, reset, restore, or migrate the existing PostgreSQL schema during startup.

## Network model

Use a shared Podman network:

```text
achievno-preprod
```

Expected setup:

- existing PostgreSQL container is attached to `achievno-preprod`
- Django API container is attached to `achievno-preprod`
- Next.js client container is attached to `achievno-preprod`
- Django reaches PostgreSQL by container network alias
- host reaches published client/API ports through localhost

## Environment model

Backend configuration is env-driven.

Required backend variables:

```env
DATABASE_URL=postgres://USER:PASSWORD@DB_HOST:5432/DB_NAME
DJANGO_SECRET_KEY=replace-me
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Frontend configuration is env-driven.

Required frontend variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCKS=false
```

## Database dependency rules

- Server startup must fail clearly if the database is unreachable.
- Health endpoints may expose separate app and DB health checks.
- Schema sanity checks should verify critical tables/views exist.
- Reset/restore scripts must require explicit confirmation.
- The normal pre-prod start path must never destroy DB state.

## Commands target

The final MVP should support commands in this style:

```bash
./scripts/preprod-up.sh
./scripts/preprod-down.sh
./scripts/preprod-logs.sh
./scripts/preprod-smoke.sh

ACHIEVNO_CONFIRM_DB_RESET=YES ./scripts/preprod-reset-db.sh
```

The reset command is a recovery path, not normal startup.

## Smoke test bar

Smoke tests should verify at least:

- Django server starts
- `/health` responds
- database connection works
- critical schema objects exist
- frontend can reach API
- auth/me returns expected unauth/auth state
- at least one P0 product read endpoint returns a valid payload once implemented

## Mocking rule

Pre-prod core screens must not silently fall back to mock data.

Mock data is allowed only through explicit dev configuration:

```env
NEXT_PUBLIC_USE_MOCKS=true
```
