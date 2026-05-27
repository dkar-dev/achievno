# Achievno Agent Rules

These rules are mandatory for all AI/code-generation work in this repository.

## Product baseline

Achievno is a mobile-first product for achievements, progress history, approvals/evidence, and challenges across three contexts:

- personal
- friend 1-on-1
- group

Achievements and challenges are separate domain entities. Do not collapse them into one generic task model.

## Current MVP direction

The current MVP target is a pre-prod-ready local version:

- Next.js client
- Django + Django REST Framework backend
- existing PostgreSQL database as an external dependency
- Podman rootless runtime
- no production hosting requirement for the 24h MVP window

The existing PostgreSQL schema is the current operational baseline. The backend must connect to it; it must not recreate or own the schema during MVP implementation.

## Architecture rules

Backend architecture:

- Django modular monolith
- bounded contexts as Django apps
- practical hexagonal structure inside each app
- DRF APIView / GenericAPIView for explicit product endpoints
- screen-oriented aggregate read APIs
- command-oriented write APIs
- Django ORM as the single normal database access path
- unmanaged Django models over the existing PostgreSQL tables

Required backend flow:

```text
DRF APIView
  -> application command/query
  -> domain policy/rules
  -> infrastructure repository/selector
  -> Django ORM unmanaged model
  -> PostgreSQL
```

Do not put business logic or ORM queries directly into API views.

## Bounded contexts

Use these MVP domain modules:

- accounts
- profiles
- friends
- groups
- achievements
- challenges
- notifications
- platform

Each domain should expose public application APIs for cross-domain access. Do not import another domain's `infrastructure/models.py` directly unless a contract explicitly allows it.

## Database rules

- Treat PostgreSQL as an external dependency.
- Existing tables use `managed = False`.
- Do not create Django migrations for the existing schema during the MVP.
- Do not modify the database schema unless the contract explicitly asks for a SQL patch.
- Raw SQL is forbidden outside infrastructure-level DB function wrappers or explicit SQL patch files.
- Existing PostgreSQL functions, triggers, views, constraints, and enums must be preserved.

## Auth rules

- Use a custom Django user model over the existing `accounts` table.
- Do not use the default `auth_user` table as the product account source.
- Access token: JWT in httpOnly cookie.
- Refresh token: opaque random token in httpOnly cookie.
- Refresh token hash is stored in the existing user session table.
- No localStorage token storage.
- Refresh rotation is not required for MVP.

## Frontend rules

- Pre-prod core screens must use API data only.
- Mock data is allowed only behind an explicit dev flag.
- No silent mock fallback for P0 screens.
- If API is unavailable, show real loading/error/empty states.

## Runtime rules

- Use Podman rootless for local pre-prod.
- Existing DB container is the baseline dependency.
- Backend and frontend containers attach to a shared Podman network.
- Server startup must not reset, restore, or recreate the database.

## Codex execution rules

- Execute the provided YAML contract exactly.
- Do not expand scope.
- Do not redesign architecture unless the contract explicitly asks for an architecture update.
- If repository state conflicts with the contract, stop and report the blocker.
- Each change must include acceptance commands in the final summary.
- Do not add unrelated cleanup, package upgrades, UI rewrites, or schema changes.

## Required response after each implementation task

Return:

- summary
- changed files
- commands run
- known gaps
- blockers, if any
