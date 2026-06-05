# Entrega Fase 0 y Fase 1

## Estado

La base de Agora queda inicializada como monolito modular Spring Boot. No se implementaron funcionalidades, entidades JPA, repositorios, servicios, DTOs, controladores REST, endpoints de negocio, usuarios, JWT ni autenticacion.

## Arbol del repositorio

```text
Agora/
|-- backend/
|-- database/
|   |-- migrations/
|   |-- model/
|   `-- seed/
|-- docs/
|   |-- api/
|   |-- arquitectura/
|   |-- backend/
|   |-- decisiones/
|   |-- diagramas/
|   `-- frontend/
|-- frontend/
|   |-- public/
|   `-- src/
|-- infrastructure/
|   |-- docker/
|   |-- monitoring/
|   |-- nginx/
|   |-- pgadmin/
|   `-- postgres/
|-- scripts/
|-- testing/
|   |-- jmeter/
|   |-- k6/
|   |-- postman/
|   `-- reports/
|-- .env.example
|-- .gitignore
|-- README.md
`-- docker-compose.yml
```

## Arbol completo del backend

```text
backend/
|-- .mvn/wrapper/maven-wrapper.properties
|-- src/
|   |-- main/
|   |   |-- java/com/agora/
|   |   |   |-- config/OpenApiConfig.java
|   |   |   |-- infrastructure/package-info.java
|   |   |   |-- modules/
|   |   |   |   |-- academic/package-info.java
|   |   |   |   |-- ai/package-info.java
|   |   |   |   |-- auth/package-info.java
|   |   |   |   |-- case_management/package-info.java
|   |   |   |   |-- feedback/package-info.java
|   |   |   |   |-- simulation/package-info.java
|   |   |   |   `-- user/package-info.java
|   |   |   |-- security/SecurityConfig.java
|   |   |   |-- shared/
|   |   |   |   |-- constants/package-info.java
|   |   |   |   |-- exception/package-info.java
|   |   |   |   |-- mapper/package-info.java
|   |   |   |   |-- response/package-info.java
|   |   |   |   |-- util/package-info.java
|   |   |   |   `-- validation/package-info.java
|   |   |   `-- AgoraApplication.java
|   |   `-- resources/
|   |       |-- db/migration/.gitkeep
|   |       |-- application-dev.yml
|   |       |-- application-prod.yml
|   |       |-- application-test.yml
|   |       `-- application.yml
|   `-- test/java/com/agora/
|       |-- architecture/ModuleArchitectureTest.java
|       `-- AgoraApplicationTests.java
|-- .dockerignore
|-- Dockerfile
|-- README.md
|-- mvnw
|-- mvnw.cmd
`-- pom.xml
```

## Dependencias configuradas

- Spring Web, Security, Data JPA, Validation y Actuator.
- PostgreSQL Driver, Hibernate y Flyway con soporte PostgreSQL.
- MapStruct y Lombok con annotation processors compatibles.
- springdoc OpenAPI/Swagger.
- JUnit 5, Mockito, Spring Security Test, Testcontainers PostgreSQL, ArchUnit y H2 para pruebas aisladas.
- Java 21, Spring Boot 3.5.7 y Maven Wrapper 3.9.11.

## Configuracion tecnica

- Docker Compose define PostgreSQL 17, pgAdmin 4 y backend opcional con perfil `full`.
- PostgreSQL y pgAdmin usan volumenes persistentes, red privada y healthchecks.
- Flyway apunta a `classpath:db/migration`; la carpeta esta vacia intencionalmente.
- Swagger UI: `/swagger-ui.html`; contrato OpenAPI: `/v3/api-docs`.
- Actuator expone `health` e `info`; salud publica en `/actuator/health`.
- Seguridad es stateless, permite solo infraestructura publica y deniega cualquier otra ruta. No existe autenticacion.
- Perfiles `dev`, `test` y `prod` separan datasource, logging y credenciales.

## Validaciones ejecutadas

| # | Validacion | Resultado |
|---|---|---|
| 1 | Compilacion Java 21 | Correcta: 17 fuentes compiladas |
| 2 | Maven build | `BUILD SUCCESS` con Maven Wrapper 3.9.11 |
| 3 | Docker Compose | Configuracion valida y servicios levantados |
| 4 | PostgreSQL | `healthy`, PostgreSQL 17.10 |
| 5 | pgAdmin | `healthy`, interfaz responde mediante redireccion HTTP |
| 6 | Spring Boot | Iniciado con Java 21.0.11 y perfil `prod` |
| 7 | Swagger/OpenAPI | OpenAPI `200`; Swagger UI redirecciona correctamente |
| 8 | Actuator | `200`, estado `UP`, liveness y readiness |
| 9 | Flyway | Valido 0 migraciones y creo `flyway_schema_history` |
| 10 | Dependencias | Resueltas durante dos builds Maven exitosos |
| 11 | Ciclos entre modulos | ArchUnit aprobado |
| 12 | Estructura modular | Paquetes presentes; busqueda sin artefactos prohibidos |

Pruebas: 2 ejecutadas, 0 fallos, 0 errores, 0 omitidas.

## Problemas encontrados y solucionados

- La maquina expone Java 8 en `PATH`: compilacion y validacion realizadas en contenedores Java 21; se dejo Maven Wrapper portable.
- Docker Desktop estaba detenido: se inicio para ejecutar las validaciones.
- pgAdmin rechazo `admin@agora.local`: se cambio a `admin@agora.example.com` y se agrego healthcheck.
- Spring Security generaba un usuario temporal: se excluyo `UserDetailsServiceAutoConfiguration` para respetar la prohibicion de autenticacion.
- El primer intento de generar Maven Wrapper fragmento la version en PowerShell: se corrigio la URL a Maven 3.9.11 y se verifico con `clean verify`.

## Estado exacto y Fase 2

Los contenedores `agora-postgres`, `agora-pgadmin` y `agora-backend` quedan ejecutandose y saludables. El repositorio Git fue inicializado, sin commit. La carpeta `backend/target` fue generada por validacion y esta ignorada.

Para iniciar Fase 2 se recomienda aprobar primero el modelo relacional y su primera migracion Flyway; despues definir contratos y ownership de modulos, estrategia JWT/refresh tokens, manejo global de errores y pruebas de integracion Testcontainers. No se debe introducir dependencia directa entre internals de modulos.

