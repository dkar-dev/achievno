# Achievno MVP backend architecture

## Decision

The MVP backend is Django + Django REST Framework.

FastAPI is not the target backend runtime for the MVP. The existing FastAPI server should be replaced, not kept as a parallel runtime.

## Product constraints

Achievno has three ownership contexts:

- personal
- friend 1-on-1
- group

Achievno has two core domain objects:

- achievement
- challenge

Achievements and challenges must remain separate concepts in API, UI, and domain code.

## Architecture style

Use a Django modular monolith with practical hexagonal boundaries.

Bounded contexts:

- accounts
- profiles
- friends
- groups
- achievements
- challenges
- notifications
- platform

Each context should follow this shape where useful:

```text
apps/<context>/
  api/
    views.py
    serializers.py
    urls.py
  application/
    commands.py
    queries.py
    services.py
  domain/
    policies.py
    errors.py
    types.py
  infrastructure/
    models.py
    selectors.py
    repositories.py
    db_functions.py
```

The structure is allowed to start minimal, but new code should move toward these boundaries instead of collapsing into a single shared file.

## Request flow

```text
DRF APIView
  -> serializer validation
  -> application command/query
  -> domain policy/rules
  -> infrastructure repository/selector
  -> Django ORM unmanaged model
  -> PostgreSQL
```

Rules:

- DRF views are HTTP adapters.
- Application layer owns use-case orchestration.
- Domain layer owns rules, policies, types, and domain errors.
- Infrastructure layer owns Django ORM access and DB-specific wrappers.
- API views must not contain business logic.
- API views must not perform direct ORM queries.

## API style

Read APIs are screen-oriented aggregate payloads.

Examples:

```text
GET /api/v1/main
GET /api/v1/groups
GET /api/v1/friends/{friend_id}
GET /api/v1/groups/{group_id}
GET /api/v1/achievements/{achievement_id}
GET /api/v1/challenges/{challenge_id}
```

Write APIs are explicit domain commands.

Examples:

```text
POST /api/v1/achievements
POST /api/v1/achievements/{id}/log
POST /api/v1/achievements/{id}/complete
POST /api/v1/achievements/{id}/archive
POST /api/v1/achievements/{id}/submit-review
POST /api/v1/reviews/{id}/approve
POST /api/v1/reviews/{id}/reject
POST /api/v1/challenges
POST /api/v1/challenges/{id}/join
POST /api/v1/challenges/{id}/leave
POST /api/v1/challenges/{id}/log-progress
```

Avoid generic CRUD-first API design for product flows.

## Database strategy

The current PostgreSQL database is the operational baseline for MVP.

- Django connects to an existing database.
- Existing tables are represented by unmanaged Django models.
- `managed = False` is required for existing schema tables.
- The MVP does not convert the current schema into Django-owned migrations.
- Schema changes are forbidden unless explicitly defined as SQL patch contracts.

PostgreSQL remains responsible for persisted state integrity:

- constraints
- foreign keys
- checks
- triggers
- functions
- views
- enums

Django application services remain responsible for product use cases and command orchestration.

## Auth strategy

Use a custom Django user model over the existing `accounts` table.

Do not use Django's default `auth_user` as the product user source.

MVP session model:

- access token: JWT in httpOnly cookie
- refresh token: opaque token in httpOnly cookie
- refresh token hash stored in existing user session table
- refresh rotation: not required in MVP
- frontend does not store tokens in localStorage

## Cross-domain access

Domains communicate through public application APIs.

Allowed:

```python
from apps.groups.application.queries import get_group_membership_context
```

Avoid:

```python
from apps.groups.infrastructure.models import GroupMembership
```

Infrastructure imports across domains require an explicit contract exception.

## Pre-prod quality bar

A P0 flow must be end-to-end:

```text
Next.js UI -> Django API -> application service -> PostgreSQL -> response -> UI state
```

If a flow cannot meet this bar, it is not P0.
