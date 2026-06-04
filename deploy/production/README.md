# Production API Runtime

This directory contains the Docker Compose runtime for the Achievno Django API on the VPS. It does not deploy the frontend; keep the Next.js frontend on Vercel.

The default compose binding is `127.0.0.1:8000:8000`. It does not bind host port `443`, because the current VPS already uses `443` for `amnezia-xray`.

## Files

- `api.Dockerfile` builds the Django API image with Gunicorn.
- `docker-compose.yml` runs only the API container and a named local evidence volume.
- `.env.example` documents required VPS environment values.
- `nginx.conf` is an optional loopback-only reverse proxy sample; it is not enabled by Compose.

## First Setup

```bash
cd /path/to/achievno
cp deploy/production/.env.example deploy/production/.env
$EDITOR deploy/production/.env
docker compose -f deploy/production/docker-compose.yml build
docker compose -f deploy/production/docker-compose.yml up -d
docker compose -f deploy/production/docker-compose.yml logs -f api
```

Do not run migrations from this compose runtime. PostgreSQL is an external dependency and must already exist.

## Public Exposure

Recommended: create a Cloudflare Tunnel route for `api.achievno.dkar-dev.ru` to `http://127.0.0.1:8000`.

Alternate: use a Cloudflare-proxied HTTPS port that is not occupied on the host, such as `8443`, if the VPS firewall and reverse proxy are configured for it.

Temporary DNS-only testing on a high port is acceptable for debugging but is not the final public setup.

Optional nginx or Caddy can sit in front of the API only if the selected host ports are free. Do not assume `80` or `443` is available on this VPS.
