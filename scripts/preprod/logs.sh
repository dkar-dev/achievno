#!/usr/bin/env bash
set -euo pipefail

API_CONTAINER="achievno-preprod-api"
CLIENT_CONTAINER="achievno-preprod-client"

if ! command -v podman >/dev/null 2>&1; then
  echo "podman is required for the local pre-prod runtime" >&2
  exit 1
fi

echo "== ${API_CONTAINER} =="
podman logs --tail 100 "${API_CONTAINER}"

echo "== ${CLIENT_CONTAINER} =="
podman logs --tail 100 "${CLIENT_CONTAINER}"
