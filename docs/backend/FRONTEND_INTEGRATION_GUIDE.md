# Frontend Integration Guide

## Autenticacion

1. Login con `POST /api/v1/auth/login`.
2. Guardar `accessToken` y `refreshToken`.
3. Enviar `Authorization: Bearer <accessToken>` en endpoints protegidos.
4. Renovar access token con `POST /api/v1/auth/refresh`.
5. Logout con `POST /api/v1/auth/logout` enviando Bearer token y refresh token.

## Errores

El frontend debe leer:

- `status`
- `error`
- `message`
- `validationErrors`

Para formularios, mapear `validationErrors` por nombre de campo.

## Paginacion

Los listados Spring Page devuelven `content`, `pageable`, `totalElements`, `totalPages`, `size`, `number`.

## Flujos recomendados

### Docente

1. Crear grupo.
2. Agregar estudiantes.
3. Crear caso.
4. Crear escenas, preguntas y opciones.
5. Crear programacion.
6. Consultar intentos, resumen y sintesis.

### Estudiante

1. Consultar grupos/casos disponibles.
2. Iniciar simulacion.
3. Responder preguntas.
4. Crear bitacora.
5. Finalizar.
6. Consultar resumen, retroalimentacion e historial IA.

## CORS

Configurar `CORS_ALLOWED_ORIGINS` con el origen real del frontend, por ejemplo:

```text
http://localhost:3000
```

Para multiples origenes usar coma:

```text
http://localhost:3000,https://frontend.example.com
```

