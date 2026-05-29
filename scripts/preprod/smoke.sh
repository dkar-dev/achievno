#!/usr/bin/env bash
set -euo pipefail

API_CONTAINER="achievno-preprod-api"
CLIENT_CONTAINER="achievno-preprod-client"
API_BASE_URL="http://127.0.0.1:8000"
CLIENT_BASE_URL="http://127.0.0.1:3000"

if ! command -v podman >/dev/null 2>&1; then
  echo "podman is required for the local pre-prod runtime" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for pre-prod smoke checks" >&2
  exit 1
fi

retry_get() {
  local url="$1"
  local attempt

  for attempt in $(seq 1 30); do
    if curl --fail --silent --show-error --output /dev/null "${url}"; then
      return 0
    fi
    sleep 1
  done

  echo "GET ${url} failed after 30 attempts" >&2
  return 1
}

podman container exists "${API_CONTAINER}"
podman container exists "${CLIENT_CONTAINER}"

retry_get "${API_BASE_URL}/health"
retry_get "${API_BASE_URL}/health/db"

podman exec "${API_CONTAINER}" python manage.py achievno_check_db
podman exec "${API_CONTAINER}" python manage.py achievno_check_models
podman exec "${API_CONTAINER}" python manage.py achievno_smoke_auth
podman exec "${API_CONTAINER}" python manage.py achievno_smoke_personal_achievements
podman exec "${API_CONTAINER}" python manage.py achievno_smoke_challenges

retry_get "${CLIENT_BASE_URL}"

echo "Pre-prod smoke checks passed."
