#!/usr/bin/env bash
set -euo pipefail

API_CONTAINER="achievno-preprod-api"
CLIENT_CONTAINER="achievno-preprod-client"

if ! command -v podman >/dev/null 2>&1; then
  echo "podman is required for the local pre-prod runtime" >&2
  exit 1
fi

podman container exists "${API_CONTAINER}"
podman container exists "${CLIENT_CONTAINER}"

podman ps --all --filter "name=achievno-preprod-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

echo "API URL: http://127.0.0.1:8000"
echo "Client URL: http://127.0.0.1:3000"
