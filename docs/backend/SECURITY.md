# Security

## Autenticacion

- JWT access token stateless.
- Refresh token persistido y rotativo.
- BCrypt con strength 12.
- Logout revoca refresh token y requiere access token valido.

## Rutas publicas

Unicamente:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `/actuator/health`
- `/actuator/health/**`
- `/v3/api-docs/**`
- `/swagger-ui.html`
- `/swagger-ui/**`

Todo lo demas requiere autenticacion y, cuando aplica, rol mediante `@PreAuthorize`.

## CORS

CORS es parametrizable:

- `CORS_ALLOWED_ORIGINS`
- `CORS_ALLOWED_METHODS`
- `CORS_ALLOWED_HEADERS`

Valores locales por defecto:

- origins: `http://localhost:3000`
- methods: `GET,POST,PUT,PATCH,DELETE,OPTIONS`
- headers: `Authorization,Content-Type`

## Datos sensibles

- `Usuario.passwordHash` no se expone en DTOs.
- Los tokens no se registran en logs por servicios propios.
- La coleccion Postman no incluye secretos reales.
- `JWT_SECRET` debe ser Base64 o Base64URL y decodificar a minimo 32 bytes.
- El fallback JWT del perfil `dev` es solo para desarrollo local; produccion debe inyectar un secreto privado por entorno.

## Recomendaciones pendientes

- Deshabilitar Swagger en ambientes publicos si no esta protegido por red.
- Definir origenes CORS por ambiente antes de produccion.
- Configurar rate limiting en gateway o reverse proxy.
- Revisar politica de rotacion de `JWT_SECRET`.

