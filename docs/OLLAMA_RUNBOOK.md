# RUNBOOK — Ollama e IA en ÁGORA

## Objetivo

Habilitar síntesis IA real (`OllamaAIProvider`) con fallback visible cuando el proveedor no responde.

## Opción A — Docker Compose (recomendado)

```bash
# Infraestructura completa + Ollama
docker compose --profile full --profile ai up -d

# Descargar modelo dentro del contenedor
docker exec agora-ollama ollama pull llama3.1:8b

# Verificar API
curl http://localhost:11434/api/tags
```

Variables relevantes (`.env`):

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT_SECONDS=180
```

El backend en Docker usa `OLLAMA_BASE_URL=http://ollama:11434` por defecto.

## Opción B — Ollama en el host

```bash
# Instalar Ollama (https://ollama.com) y levantar servicio
ollama serve

# Modelo
ollama pull llama3.1:8b

# Backend local (sin Docker) apunta a localhost
export OLLAMA_BASE_URL=http://localhost:11434
```

Si el backend corre en Docker pero Ollama en el host:

```env
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

## Probar IA desde la API

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"correo":"estudiante@agora.com","password":"Agora12345*"}' | jq -r .accessToken)

# Reemplazar ATTEMPT_ID por un intento FINALIZADO
curl -s -X POST "http://localhost:8080/api/v1/attempts/ATTEMPT_ID/ai/summary" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{}' | jq .
```

Interpretación del resultado:

| `modeloUtilizado` | `fueExitosa` | Significado en UI |
|---|---|---|
| contiene `llama` | `true` | **IA real (Ollama)** |
| `mock-ai-provider-v1` | `true` | **Fallback mock** |
| `local-deterministic-fallback-v1` | `false` | **Fallback determinístico** |

## Endpoints CM2 relacionados

- `POST /api/v1/simulations/{id}/answer` — devuelve `consecuencia` + `estados`
- `GET /api/v1/attempts/{id}/consequences` — consecuencias acumuladas
- `GET /api/v1/attempts/{id}/pedagogical-analysis` — feedback clínico/pedagógico estructurado
- `POST /api/v1/attempts/{id}/ai/summary` — síntesis IA

## Validación automatizada

```bash
node frontend/scripts/validate-phase-cm2.mjs
```

## Caso oficial integrado

Migración `V12__cm2_clinical_consequences_official_case.sql`:

- Título: **Caso juego social PSICOLOGIA SOCIAL**
- 5 escenas, opciones con consecuencias e impactos emocionales
- Curso y programación de demo para estudiante

Visible en repositorio de casos para docente, docente admin y estudiante matriculado.

## Troubleshooting

1. **`Connection refused` a Ollama** — verificar contenedor `agora-ollama` o `ollama serve`.
2. **Modelo no encontrado** — ejecutar `ollama pull llama3.1:8b`.
3. **Timeout** — aumentar `OLLAMA_TIMEOUT_SECONDS`.
4. **Fallback mock** — Ollama no respondió; revisar logs del backend (`ai.provider=ollama event=generation_failed`).
