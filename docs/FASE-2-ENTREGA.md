# Proyecto Agora - Entrega Fase 2

## Alcance

Fase 2 implementada: seguridad, usuarios, roles, JWT y refresh tokens.

No se avanzo a Fase 3. El trabajo queda limitado a autenticacion, autorizacion base, usuarios, roles, auditoria de eventos de seguridad y configuracion necesaria para ejecutar con Docker.

## Archivos principales creados o modificados

- `backend/pom.xml`: dependencias JJWT.
- `docker-compose.yml`: variables JWT para el backend.
- `.env.example`: variables JWT documentadas.
- `backend/src/main/resources/application.yml`: configuracion de JWT y fase del proyecto.
- `backend/src/main/resources/application-test.yml`: configuracion H2/JWT para tests.
- `backend/src/main/resources/db/migration/V1__create_security_schema.sql`.
- `backend/src/main/resources/db/migration/V2__seed_roles_and_test_users.sql`.
- `backend/src/main/java/com/agora/AgoraApplication.java`.
- `backend/src/main/java/com/agora/config/OpenApiConfig.java`.
- `backend/src/main/java/com/agora/security/*`.
- `backend/src/main/java/com/agora/modules/auth/*`.
- `backend/src/main/java/com/agora/modules/user/*`.
- `backend/src/main/java/com/agora/shared/exception/*`.
- `backend/src/test/java/com/agora/security/JwtServiceTest.java`.
- `backend/src/test/java/com/agora/modules/auth/service/*Test.java`.
- `backend/src/test/java/com/agora/modules/auth/controller/AuthControllerIntegrationTest.java`.

## Migraciones Flyway

`V1__create_security_schema.sql` crea:

- `rol`
- `usuario`
- `refresh_token`
- `auditoria`
- Indices para busquedas por correo, token, usuario, expiracion y eventos.

`V2__seed_roles_and_test_users.sql` inserta:

- Roles: `ESTUDIANTE`, `DOCENTE`, `ADMINISTRADOR`.
- Usuarios de prueba:
  - `admin@agora.com`
  - `docente@agora.com`
  - `estudiante@agora.com`

Password de los tres usuarios: `Agora12345*`.

## Entidades y repositorios

Entidades:

- `Rol`
- `Usuario`
- `RefreshToken`
- `Auditoria`

Repositorios:

- `RolRepository`
- `UsuarioRepository`
- `RefreshTokenRepository`
- `AuditoriaRepository`

## Servicios

- `JwtService`: emision y validacion de access tokens JWT.
- `AgoraUserDetailsService`: carga usuarios activos desde base de datos.
- `AuthService`: login, refresh, logout y usuario autenticado.
- `RefreshTokenService`: crea, valida, rota y revoca refresh tokens.
- `AuditoriaService`: registra eventos de seguridad.

## Controladores y endpoints

Base path: `/api/v1/auth`.

- `POST /login`: autentica correo/password y devuelve access token, refresh token y usuario.
- `POST /refresh`: valida refresh token, lo rota y devuelve nuevo access token y refresh token.
- `POST /logout`: revoca el refresh token enviado.
- `GET /me`: devuelve el usuario autenticado usando Bearer JWT.

Infraestructura publica:

- `/actuator/health`
- `/v3/api-docs/**`
- Swagger UI

El resto de endpoints queda protegido por JWT.

## Ejemplos

Login:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "correo": "admin@agora.com",
  "password": "Agora12345*"
}
```

Respuesta esperada:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "usuario": {
    "id": 1,
    "correo": "admin@agora.com",
    "nombre": "Administrador Agora",
    "rol": "ADMINISTRADOR"
  }
}
```

Refresh:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}
```

Logout:

```http
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "..."
}
```

Me:

```http
GET /api/v1/auth/me
Authorization: Bearer <access-token>
```

## Eventos de auditoria

Se registran estos eventos:

- `LOGIN_EXITOSO`
- `LOGIN_FALLIDO`
- `REFRESH_TOKEN_USADO`
- `LOGOUT`

## Validacion ejecutada

Build y tests:

- `docker compose build backend`: exitoso.
- `docker run --rm -v ".../backend:/workspace" -w /workspace eclipse-temurin:21-jdk-alpine ./mvnw -B clean verify`: exitoso.
- Resultado de tests: 9 tests, 0 fallos, 0 errores.

Docker y base de datos:

- `docker compose --profile full up -d --force-recreate backend`: exitoso.
- `docker compose config --quiet`: exitoso.
- Contenedores finales: backend, postgres y pgAdmin levantados.
- Flyway dejo el esquema en version 2.
- Tablas verificadas: `rol`, `usuario`, `refresh_token`, `auditoria`.

HTTP:

- Login exitoso con `admin@agora.com`, `docente@agora.com` y `estudiante@agora.com`.
- `/api/v1/auth/me` responde con JWT valido.
- `/api/v1/auth/me` sin JWT responde 401.
- Login incorrecto responde 401.
- Refresh token rota correctamente.
- Refresh token anterior queda invalido despues de rotacion.
- Logout revoca el refresh token.
- `/actuator/health` responde 200.
- `/v3/api-docs` responde 200.

## Problemas encontrados y solucion

- `UserPrincipal` necesitaba implementar explicitamente `getPassword()`.
- `JwtService` requeria que el parser usara el mismo `Clock` inyectado para tests deterministas.
- Spring necesitaba constructores no ambiguos en `JwtService` y `RefreshTokenService`.
- Se ajusto la configuracion de `AuthenticationManager` para evitar registrar un provider innecesario como bean publico.
- Se reemplazo `curl.exe` con `Invoke-RestMethod` en validaciones manuales por problemas de escaping JSON en PowerShell.
- Se agrego `.env` local ignorado por Git para que Docker Compose tenga `JWT_SECRET` durante desarrollo.

## Estado para Fase 3

La Fase 3 puede partir de:

- Backend Spring Boot protegido por JWT.
- Roles y usuarios base creados por Flyway.
- Refresh tokens persistidos, rotables y revocables.
- Auditoria basica de seguridad disponible.
- Swagger/OpenAPI con esquema Bearer JWT.
- Tests unitarios e integracion de autenticacion en verde.
- Docker Compose validado con PostgreSQL, backend y pgAdmin.

Pendiente deliberadamente para fases futuras:

- Endpoints funcionales de dominio fuera de auth/security.
- Politicas finas por rol con reglas de negocio especificas.
- Pantallas frontend de login o consumo de JWT.
- Recuperacion de password, verificacion de correo o MFA.
