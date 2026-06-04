# DEP1 VPS Docker CI and R2 Storage Foundation

## Goal

Prepare Achievno backend for deployment on the user's own VPS while keeping the already deployed Vercel frontend. Add production-oriented Docker deployment files, GitHub Actions CI/deploy scaffolding, domain/env docs, and Cloudflare R2 evidence storage foundation. Do not implement approval/evidence product UI yet.

## Starting context

Current release snapshot:

- Tag target already created: `mvp-local-preprod-v0.2.0`.
- Local pre-prod MVP works with Podman scripts.
- Frontend is already used on Vercel.
- Backend is currently local/pre-prod only.
- Server target: user's own Ubuntu VPS.
- Preferred public API domain: `api.achievno.dkar-dev.ru`.
- Future evidence file storage: Cloudflare R2.

## Hard rules

- Do not change PostgreSQL schema.
- Do not create Django migrations.
- Do not reset/recreate/restore production or local DB.
- Do not commit secrets.
- Do not break local pre-prod Podman scripts.
- Do not break current MVP flows or smoke commands.
- Do not implement approval/evidence UI in this task.
- Do not move frontend away from Vercel.
- Keep changes deploy-oriented and bounded.
- Commit and push after checks pass.

## Priority 0 — Verify release base

Before editing:

- Pull latest main.
- Verify D1 commit `4f57af0` or newer is present.
- Verify tag `mvp-local-preprod-v0.2.0` exists locally or on origin.
- Run a quick status check.

If main is not at the expected release baseline, stop and report.

## Priority 1 — Production backend container runtime

Current local container may use Django runserver. Production deployment must use a production WSGI runtime.

Required:

- Add Gunicorn dependency to backend package configuration.
- Add production backend container entrypoint/command using:
  - `gunicorn config.wsgi:application --bind 0.0.0.0:8000`
- Keep existing local Podman pre-prod runtime intact.
- Add production Dockerfile/Containerfile only if needed; otherwise reuse existing `app/server/Containerfile` carefully without breaking pre-prod.
- Do not run migrations automatically.
- Do not collect static unless needed for current API deployment.

Preferred files:

```text
deploy/production/api.Dockerfile
or app/server/Containerfile with prod target if cleaner
```

## Priority 2 — VPS docker compose deployment

Add deployment files for the VPS.

Required structure:

```text
deploy/production/
  docker-compose.yml
  nginx.conf or Caddyfile
  .env.example
  README.md
```

Required behavior:

- API container listens on internal port 8000.
- Reverse proxy exposes HTTPS API domain.
- Production env is loaded from `.env` on the VPS, not committed.
- Container restart policy is set.
- Logs are inspectable with docker compose logs.
- Production compose must not include real secrets.

Database choice:

- Prefer external/managed `DATABASE_URL` or existing VPS Postgres URL.
- If a Postgres service is included for convenience, it must be clearly optional and use a named volume.
- Do not overwrite existing DB data.

Reverse proxy:

- If using nginx, include config for `api.achievno.dkar-dev.ru` proxying to API container.
- If using Caddy, include equivalent Caddyfile.
- Keep it simple. TLS can be handled by nginx+certbot or Caddy.

## Priority 3 — GitHub Actions CI

Add CI workflow.

Required:

```text
.github/workflows/ci.yml
```

CI must run on pull requests and pushes to main:

- backend check
- backend tests
- frontend build
- frontend lint
- frontend typecheck

CI must not require production secrets.

## Priority 4 — GitHub Actions deploy over SSH

Add deploy workflow scaffold.

Required:

```text
.github/workflows/deploy-api.yml
```

Behavior:

- Trigger manually via `workflow_dispatch` and optionally on push to main after CI is green.
- Connect to VPS through SSH.
- Pull latest repository or copy deployment files.
- Build/restart backend with Docker Compose.
- Run lightweight backend health check after deploy.
- Do not echo secrets.

Expected GitHub Secrets to document:

```text
VPS_HOST
VPS_USER
VPS_SSH_KEY
VPS_DEPLOY_PATH
PROD_DATABASE_URL
DJANGO_SECRET_KEY
ACCESS_TOKEN_SECRET
EMAIL_HOST_USER
EMAIL_HOST_PASSWORD
```

Optional future R2 secrets:

```text
CLOUDFLARE_R2_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET
CLOUDFLARE_R2_ENDPOINT_URL
```

## Priority 5 — Cloudflare R2 evidence storage foundation

Add only storage foundation, not product UI.

Required:

- Add Django settings/env placeholders for Cloudflare R2 S3-compatible storage.
- Add a small storage adapter interface for evidence files.
- Add a Cloudflare R2 adapter implementation if dependencies are reasonable.
- Add local/noop or filesystem fallback for tests if needed.
- Add docs explaining bucket creation and required secrets.
- Do not wire approval/evidence UI yet.
- Do not require R2 credentials for normal tests.

Preferred backend files:

```text
app/server/apps/platform/infrastructure/storage.py
app/server/apps/platform/tests/test_storage.py
```

Env names:

```text
EVIDENCE_STORAGE_BACKEND=local|r2
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=achievno-evidence-dev
CLOUDFLARE_R2_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
```

## Priority 6 — Deployment documentation

Update docs:

```text
docs/dev/DEPLOYMENT_VPS.md
README.md if needed
```

Docs must include:

- DNS plan for `api.achievno.dkar-dev.ru`.
- VPS package setup commands.
- Docker Compose deploy commands.
- GitHub Secrets list.
- Vercel frontend env:
  - `NEXT_PUBLIC_API_BASE_URL=https://api.achievno.dkar-dev.ru`
  - `NEXT_PUBLIC_USE_MOCKS=false`
- Cloudflare R2 bucket setup commands.
- Rollback basics.

## Acceptance commands

Run locally:

```bash
cd app/server && uv run python manage.py check
cd app/server && uv run python manage.py test
cd app/client && npm run build
cd app/client && npm run lint
cd app/client && npx tsc --noEmit
```

If production compose can be tested locally without secrets, run a dry build:

```bash
docker compose -f deploy/production/docker-compose.yml config
```

Keep local pre-prod smoke green:

```bash
PREPROD_PODMAN_NETWORK="$PREPROD_PODMAN_NETWORK" PREPROD_DATABASE_URL="$PREPROD_DATABASE_URL" scripts/preprod/smoke.sh
```

## Manual server acceptance docs

Do not claim VPS deployment passed unless actually run. If not run, report deployment files prepared but server deploy not executed.

If run on VPS, verify:

- `docker compose ps`
- `curl -f https://api.achievno.dkar-dev.ru/health`
- `curl -f https://api.achievno.dkar-dev.ru/health/db`
- Vercel frontend can call backend with cookies/CORS.

## Required final report

Return exactly:

- summary
- changed_files
- commands_run
- production_runtime_result
- ci_result
- deploy_workflow_result
- r2_storage_foundation_result
- deployment_docs_result
- server_manual_result
- commit_hash
- known_gaps
- blockers_if_any

## Commit

Commit and push after checks pass.

Commit message:

```text
chore: add vps deploy ci and r2 storage foundation
```
