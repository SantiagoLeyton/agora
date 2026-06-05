# API Contracts

Base URL local: `http://localhost:8080`

Version base: `/api/v1`

## Formato de errores

Todas las respuestas de error usan:

```json
{
  "timestamp": "2026-06-05T16:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Solicitud invalida",
  "path": "/api/v1/resource",
  "validationErrors": {
    "campo": "mensaje"
  }
}
```

Codigos revisados:

- `400`: validacion o regla de negocio.
- `401`: no autenticado, token invalido o refresh token invalido.
- `403`: rol insuficiente o acceso fuera de alcance.
- `404`: recurso inexistente.
- `409`: conflicto de unicidad o duplicado funcional.
- `500`: error interno no controlado.

## Paginacion

Los listados administrativos y consultas masivas usan parametros Spring Data:

- `page`
- `size`
- `sort`

## Endpoints principales

- Auth: `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`, `/api/v1/auth/me`
- Users: `/api/v1/users`
- Roles: `/api/v1/roles`
- Audit: `/api/v1/audit`
- Groups: `/api/v1/groups`
- Group students: `/api/v1/groups/{groupId}/students`
- Schedules: `/api/v1/schedules`
- Cases: `/api/v1/cases`
- Builder: `/api/v1/cases/{id}/builder`
- Simulation: `/api/v1/simulations`
- Attempts: `/api/v1/attempts/{attemptId}`
- AI: `/api/v1/attempts/{attemptId}/ai/summary`

## Brecha conocida

El modelo de consecuencias del motor de simulacion existe en base de datos y dominio, pero no hay endpoints administrativos para configurar consecuencias y variaciones de estado. Para pruebas completas de consecuencias se requiere seed SQL o una fase futura de administracion de consecuencias.

