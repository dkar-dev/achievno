#!/usr/bin/env bash
set -euo pipefail

API_CONTAINER="achievno-preprod-api"
CLIENT_CONTAINER="achievno-preprod-client"

if ! command -v podman >/dev/null 2>&1; then
  echo "podman is required for the local pre-prod runtime" >&2
  exit 1
fi

podman rm --force --ignore "${CLIENT_CONTAINER}"
podman rm --force --ignore "${API_CONTAINER}"
