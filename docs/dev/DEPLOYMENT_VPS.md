# VPS Deployment Notes

Achievno keeps the frontend on Vercel and deploys only the Django API to the user's Ubuntu VPS.

## VPS Constraints

- Docker and the Docker Compose plugin are expected to be installed.
- Existing Amnezia containers must not be stopped, removed, or reconfigured.
- Host port `443` is already occupied by `amnezia-xray`.
- Do not assume `443`, `500/udp`, `4500/udp`, `44073/udp`, or `49630/udp` are available.

## DNS Plan

Use `api.achievno.dkar-dev.ru` for the public API.

Recommended exposure path:

1. Keep the API bound to `127.0.0.1:8000`.
2. Create a Cloudflare Tunnel public hostname:
   - hostname: `api.achievno.dkar-dev.ru`
   - service: `http://127.0.0.1:8000`
3. Set Vercel frontend env:
   - `NEXT_PUBLIC_API_BASE_URL=https://api.achievno.dkar-dev.ru`
   - `NEXT_PUBLIC_USE_MOCKS=false`

Alternate exposure path: use a Cloudflare-proxied HTTPS port such as `8443` only if that port is free and the VPS firewall allows it. DNS-only high-port testing is acceptable for temporary debugging, not final production.

`deploy/production/nginx.conf` is a loopback-only optional sample on `127.0.0.1:8080`. It is not enabled by Compose and does not solve public HTTPS by itself.

## VPS Package Setup

```bash
sudo apt-get update
sudo apt-get install -y git ca-certificates curl
docker --version
docker compose version
```

## Deploy Commands

```bash
git clone git@github.com:dkar-dev/achievno.git /opt/achievno
cd /opt/achievno
cp deploy/production/.env.example deploy/production/.env
$EDITOR deploy/production/.env
docker compose -f deploy/production/docker-compose.yml config
docker compose -f deploy/production/docker-compose.yml build api
docker compose -f deploy/production/docker-compose.yml up -d api
docker compose -f deploy/production/docker-compose.yml logs -f api
```

The production runtime uses Gunicorn:

```text
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

It does not run migrations, reset the database, or create PostgreSQL. `DATABASE_URL` must point at an existing PostgreSQL database.

## Health Checks

On the VPS:

```bash
curl -f http://127.0.0.1:8000/health
curl -f http://127.0.0.1:8000/health/db
```

After a Cloudflare Tunnel is configured:

```bash
curl -f https://api.achievno.dkar-dev.ru/health
```

## GitHub Secrets

Required for the deploy workflow:

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

## Cloudflare R2 Evidence Storage

The current task only adds the storage foundation. It does not add approval/evidence UI.

Create the bucket in Cloudflare R2:

```bash
wrangler r2 bucket create achievno-evidence-dev
```

Set these env values on the VPS when switching from local evidence storage to R2:

```text
EVIDENCE_STORAGE_BACKEND=r2
CLOUDFLARE_R2_ACCOUNT_ID=<account-id>
CLOUDFLARE_R2_ACCESS_KEY_ID=<access-key-id>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<secret-access-key>
CLOUDFLARE_R2_BUCKET=achievno-evidence-dev
CLOUDFLARE_R2_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
```

Normal tests and local pre-prod do not require R2 credentials.

## Rollback

```bash
cd /opt/achievno
git log --oneline -5
git checkout <previous-good-commit>
docker compose -f deploy/production/docker-compose.yml build api
docker compose -f deploy/production/docker-compose.yml up -d api
docker compose -f deploy/production/docker-compose.yml logs -f api
```

Use `git checkout main && git pull --ff-only origin main` to return to the latest main after a temporary rollback.
