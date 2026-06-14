#!/usr/bin/env bash
# Unifica el backend en localhost:8080 eliminando contenedores fantasma de Docker.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
GHOST_BACKEND_ID="46dc99229050c2bcb01c718e479913550b01ce2d7508115c5c1f00fef80a93b6"
SOCKET="${DOCKER_HOST:-unix:///var/run/docker.sock}"

docker_api() {
  curl -sS --unix-socket "${SOCKET#unix://}" "$@"
}

echo "==> Deteniendo backends duplicados"
docker rm -f agora-backend agora-backend-cm5-run agora-backend-official \
  agora-legacy-debug agora-old-debug agora-debug-500 2>/dev/null || true

if docker_api "http://localhost/containers/${GHOST_BACKEND_ID}/json" >/dev/null 2>&1; then
  echo "==> Eliminando contenedor fantasma legacy (${GHOST_BACKEND_ID:0:12})"
  docker_api -X POST "http://localhost/containers/${GHOST_BACKEND_ID}/stop" >/dev/null || true
  docker_api -X DELETE "http://localhost/containers/${GHOST_BACKEND_ID}?force=true" >/dev/null || true
fi

echo "==> Construyendo imagen unificada"
docker build -t agora-backend:unified "${ROOT}/backend"

echo "==> Levantando PostgreSQL"
cd "${ROOT}"
docker compose up -d postgres

echo "==> Desplegando backend oficial en :8080"
docker run -d --name agora-backend \
  --network agora_agora-network \
  --restart unless-stopped \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=agora \
  -e DB_USER=agora \
  -e DB_PASSWORD=agora-local-password \
  -e JWT_SECRET=AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA= \
  -e CORS_ALLOWED_ORIGINS=http://localhost:3000 \
  -e AI_PROVIDER=ollama \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  --add-host=host.docker.internal:host-gateway \
  agora-backend:unified

echo "==> Esperando health"
for _ in $(seq 1 30); do
  if curl -sf http://localhost:8080/actuator/health >/dev/null; then
    echo "Backend UP en http://localhost:8080"
    exit 0
  fi
  sleep 2
done

echo "Backend no respondió a tiempo" >&2
exit 1
