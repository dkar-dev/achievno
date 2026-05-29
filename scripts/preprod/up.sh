#!/usr/bin/env bash
set -euo pipefail

API_IMAGE="localhost/achievno-api:preprod"
CLIENT_IMAGE="localhost/achievno-client:preprod"
API_CONTAINER="achievno-preprod-api"
CLIENT_CONTAINER="achievno-preprod-client"
PREPROD_DB_URL="${PREPROD_DATABASE_URL:-${DATABASE_URL:-}}"
PREPROD_PODMAN_NETWORK="${PREPROD_PODMAN_NETWORK:-}"
PODMAN_NETWORK_ARGS=()
API_ENV_FILE_ARGS=()

if ! command -v podman >/dev/null 2>&1; then
  echo "podman is required for the local pre-prod runtime" >&2
  exit 1
fi

if [ -z "${PREPROD_DB_URL}" ]; then
  echo "PREPROD_DATABASE_URL or DATABASE_URL is required for the backend container" >&2
  echo "Use host.containers.internal for a PostgreSQL port published on the host." >&2
  exit 1
fi

if [ -n "${PREPROD_PODMAN_NETWORK}" ]; then
  PODMAN_NETWORK_ARGS=(--network "${PREPROD_PODMAN_NETWORK}")
fi

if [ -f ".env.preprod.local" ]; then
  API_ENV_FILE_ARGS=(--env-file .env.preprod.local)
fi

podman run \
  --detach \
  --replace \
  --name "${API_CONTAINER}" \
  "${PODMAN_NETWORK_ARGS[@]}" \
  "${API_ENV_FILE_ARGS[@]}" \
  --publish 127.0.0.1:8000:8000 \
  --env "DATABASE_URL=${PREPROD_DB_URL}" \
  --env "PREPROD_DATABASE_URL=${PREPROD_DB_URL}" \
  --env "DJANGO_DEBUG=${DJANGO_DEBUG:-false}" \
  --env "DJANGO_ALLOWED_HOSTS=${DJANGO_ALLOWED_HOSTS:-localhost,127.0.0.1,achievno-preprod-api,testserver}" \
  --env "CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-http://127.0.0.1:3000,http://localhost:3000}" \
  --env "DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY:-django-insecure-achievno-local-preprod-only}" \
  --env "ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET:-django-insecure-achievno-local-preprod-access-only}" \
  "${API_IMAGE}"

podman run \
  --detach \
  --replace \
  --name "${CLIENT_CONTAINER}" \
  "${PODMAN_NETWORK_ARGS[@]}" \
  --publish 127.0.0.1:3000:3000 \
  --env "NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-http://127.0.0.1:8000}" \
  --env "NEXT_PUBLIC_USE_MOCKS=${NEXT_PUBLIC_USE_MOCKS:-false}" \
  "${CLIENT_IMAGE}"

echo "Achievno local pre-prod is starting:"
echo "  API:    http://127.0.0.1:8000"
echo "  Client: http://127.0.0.1:3000"
