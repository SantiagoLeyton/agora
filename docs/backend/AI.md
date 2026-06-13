# IA local con Ollama

Estado: Corrección Mayor 2.

Ágora usa una arquitectura de IA desacoplada. El proveedor principal es **Ollama** (`llama3.1:8b`); si falla, el backend activa **MockAIProvider** y, en última instancia, una síntesis determinística — sin responder HTTP 500.

## Arquitectura

| Componente | Rol |
|----------|-----|
| `AIProvider` | Puerto de abstracción |
| `OllamaAIProvider` | Proveedor principal (`POST /api/generate`) |
| `MockAIProvider` | Fallback estructurado |
| `AISummaryService` | Orquestación + persistencia en `sintesis_ia` |
| `PedagogicalAnalysisService` | Análisis pedagógico **determinístico** (RDA, estados, consecuencias) |

### Endpoints

- `POST /api/v1/simulations/{id}/answer` — consecuencia inmediata + estados emocionales
- `GET /api/v1/attempts/{id}/consequences` — consecuencias acumuladas
- `GET /api/v1/attempts/{id}/pedagogical-analysis` — feedback clínico/pedagógico estructurado
- `POST /api/v1/attempts/{id}/ai/summary` — síntesis IA (Ollama → mock → determinístico)
- `GET /api/v1/attempts/{id}/ai/summary` — historial de síntesis

## Configuración

```yaml
ai:
  provider: ${AI_PROVIDER:ollama}

ollama:
  base-url: ${OLLAMA_BASE_URL:http://localhost:11434}
  model: ${OLLAMA_MODEL:llama3.1:8b}
  timeout-seconds: ${OLLAMA_TIMEOUT_SECONDS:180}
```

### Docker Compose (recomendado)

Ollama está incluido en `docker-compose.yml` con perfil `full`:

```bash
docker compose --profile full up -d
docker exec agora-ollama ollama pull llama3.1:8b
```

Variables en el contenedor backend:

```env
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT_SECONDS=180
```

### Ollama en el host (backend local)

```bash
ollama serve
ollama pull llama3.1:8b
export OLLAMA_BASE_URL=http://localhost:11434
```

Si el backend corre en Docker y Ollama en el host: `OLLAMA_BASE_URL=http://host.docker.internal:11434`

## Etiquetas en la UI

| `modeloUtilizado` | `fueExitosa` | Etiqueta |
|---|---|---|
| contiene `llama` | `true` | **IA real (Ollama)** |
| `mock-ai-provider-v1` | `true` | **Fallback mock** |
| `local-deterministic-fallback-v1` | `false` | **Fallback determinístico** |

## Operación

Documentación operativa completa: [`docs/OLLAMA_RUNBOOK.md`](../OLLAMA_RUNBOOK.md)

Validación automatizada:

```bash
node frontend/scripts/validate-phase-cm2.mjs
```

## Caso oficial CM2

El caso **"Caso juego social PSICOLOGIA SOCIAL"** se carga vía migración `V12__cm2_clinical_consequences_official_case.sql` con 5 escenas, consecuencias clínicas por opción e impactos en los 5 ejes emocionales.
