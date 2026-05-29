#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_IMAGE="localhost/achievno-api:preprod"
CLIENT_IMAGE="localhost/achievno-client:preprod"
NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-http://127.0.0.1:8000}"
NEXT_PUBLIC_USE_MOCKS="${NEXT_PUBLIC_USE_MOCKS:-false}"

if ! command -v podman >/dev/null 2>&1; then
  echo "podman is required for the local pre-prod runtime" >&2
  exit 1
fi

podman build \
  --tag "${API_IMAGE}" \
  --file "${ROOT_DIR}/app/server/Containerfile" \
  "${ROOT_DIR}/app/server"

podman build \
  --tag "${CLIENT_IMAGE}" \
  --build-arg "NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}" \
  --build-arg "NEXT_PUBLIC_USE_MOCKS=${NEXT_PUBLIC_USE_MOCKS}" \
  --file "${ROOT_DIR}/app/client/Containerfile" \
  "${ROOT_DIR}/app/client"
