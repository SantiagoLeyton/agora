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
$env:JWT_SECRET="replace-with-a-base64-encoded-secret-of-at-least-32-bytes"
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

## URLs utiles

- Backend: `http://localhost:8080`
- Health: `http://localhost:8080/actuator/health`
- Swagger: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- pgAdmin: `http://localhost:5050`

## Flyway

El backend aplica migraciones al arrancar. Version actual esperada: V7.

