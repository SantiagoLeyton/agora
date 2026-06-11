# Runbook Dev

## Requisitos

- Java 21
- Maven Wrapper incluido
- Docker y Docker Compose
- PostgreSQL mediante Docker Compose

## Levantar infraestructura

```powershell
docker compose up -d postgres pgadmin
```

## Levantar backend completo

```powershell
docker compose --profile full up -d --build backend
```

## Ejecutar localmente

Configurar variables:

```powershell
$env:JWT_SECRET=[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="agora"
$env:DB_USER="agora"
$env:DB_PASSWORD="agora-local-password"
```

Luego:

```powershell
cd backend
./mvnw spring-boot:run
```

`JWT_SECRET` debe ser un valor Base64 o Base64URL que decodifique a minimo 32 bytes.
El perfil `dev` incluye un fallback local para facilitar el arranque, pero no debe usarse en produccion.

## URLs utiles

- Backend: `http://localhost:8080`
- Health: `http://localhost:8080/actuator/health`
- Swagger: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- pgAdmin: `http://localhost:5050`

## Flyway

El backend aplica migraciones al arrancar. Version actual esperada: V7.

