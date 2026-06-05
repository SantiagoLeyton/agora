# IA local con Ollama

Estado: Fase 10.

Agora usa una arquitectura de IA desacoplada. El backend no depende de OpenAI, Gemini ni servicios pagos externos. El proveedor principal es Ollama local con el modelo `llama3.1:8b`; el proveedor de respaldo sigue siendo `MockAIProvider`.

## Arquitectura

- Puerto: `AIProvider`
- Proveedor principal: `OllamaAIProvider`
- Proveedor fallback: `MockAIProvider`
- Servicio orquestador: `AISummaryService`
- Persistencia: `sintesis_ia`
- Endpoints:
  - `POST /api/v1/attempts/{attemptId}/ai/summary`
  - `GET /api/v1/attempts/{attemptId}/ai/summary`

El servicio intenta generar la sintesis con Ollama. Si Ollama falla por timeout, conexion rechazada, modelo inexistente, respuesta vacia, respuesta invalida, error HTTP o excepcion inesperada, el error se persiste y se ejecuta `MockAIProvider`. El usuario final recibe una sintesis alternativa y la API no debe responder 500 por fallos del proveedor IA.

## Configuracion

Configuracion por defecto:

```yaml
ai:
  provider: ${AI_PROVIDER:ollama}

ollama:
  base-url: ${OLLAMA_BASE_URL:http://localhost:11434}
  model: ${OLLAMA_MODEL:llama3.1:8b}
  timeout-seconds: ${OLLAMA_TIMEOUT_SECONDS:60}
```

Cuando el backend corre en Docker y Ollama corre en la maquina host, usar:

```env
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT_SECONDS=60
```

No se incluye Ollama en `docker-compose.yml`. Ollama debe ejecutarse como servicio local del sistema operativo.

## Instalacion local de Ollama

1. Instalar Ollama desde el instalador oficial del sistema operativo.
2. Iniciar el servicio local:

```bash
ollama serve
```

3. Descargar el modelo:

```bash
ollama pull llama3.1:8b
```

4. Verificar modelos disponibles:

```bash
ollama list
```

## Flujo de generacion

1. El usuario solicita `POST /api/v1/attempts/{attemptId}/ai/summary`.
2. `AISummaryService` valida permisos sobre el intento.
3. Se registra `AI_SUMMARY_REQUESTED`.
4. Se construye un prompt interno con:
   - informacion del caso
   - estado final del intento
   - estados emocionales actuales
   - respuestas seleccionadas
   - bitacoras del estudiante
   - instrucciones academicas del usuario
   - restricciones explicitas contra calificar o evaluar
5. `OllamaAIProvider` invoca `POST /api/generate` con `stream=false`.
6. Si Ollama responde correctamente:
   - se persiste `sintesis_ia.fue_exitosa=true`
   - se registra `AI_SUMMARY_GENERATED`
   - se devuelve la sintesis
7. Si Ollama falla:
   - se persiste una sintesis fallida con `fue_exitosa=false`
   - se registra `AI_SUMMARY_FAILED`
   - se ejecuta `MockAIProvider`
   - se persiste y devuelve la sintesis fallback

## Restricciones academicas del prompt

El prompt interno obliga a la IA a:

- no asignar notas
- no evaluar desempeno
- no aprobar ni reprobar
- no calificar
- no determinar exito academico
- describir, interpretar y sintetizar unicamente

Estas restricciones preservan la regla central de Agora: la IA no define calificaciones academicas ni modifica reglas de negocio.

## Logs

Los logs estructurados incluyen:

- solicitud de generacion
- exito del proveedor Ollama
- tiempo de respuesta
- falla del proveedor
- activacion de fallback
- error controlado

No se registra el prompt completo ni datos sensibles.

## Troubleshooting

`Connection refused`

Ollama no esta corriendo o `OLLAMA_BASE_URL` apunta a un host incorrecto.

`model not found`

Ejecutar:

```bash
ollama pull llama3.1:8b
```

Timeout

Incrementar:

```env
OLLAMA_TIMEOUT_SECONDS=120
```

Backend en Docker no alcanza Ollama local

Usar:

```env
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

Respuesta vacia o invalida

El backend persistira el fallo y devolvera fallback. Revisar logs de Ollama y confirmar que el modelo puede responder con:

```bash
ollama run llama3.1:8b
```
