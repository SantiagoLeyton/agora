# Agora

Agora is an educational simulation platform for Social Psychology students. This repository currently contains the Phase 0 and Phase 1 foundation: repository layout, modular backend architecture, development infrastructure, and quality guardrails.

No domain functionality, persistence model, REST controller, authentication flow, or AI integration is implemented in this phase.

## Technology

- Java 21 and Spring Boot 3
- Spring Security, Spring Data JPA, Hibernate, Bean Validation
- PostgreSQL and Flyway
- MapStruct and Lombok
- OpenAPI/Swagger and Actuator
- JUnit 5, Mockito, Testcontainers, and ArchUnit
- Docker Compose and Maven Wrapper

## Quick start

1. Install Java 21 and Docker Desktop.
2. Copy `.env.example` to `.env` and replace development credentials.
3. Run `docker compose up -d postgres pgadmin`.
4. Run `cd backend` and then `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`.

Useful URLs:

- Swagger UI: <http://localhost:8080/swagger-ui.html>
- OpenAPI JSON: <http://localhost:8080/v3/api-docs>
- Health: <http://localhost:8080/actuator/health>
- pgAdmin: <http://localhost:5050>

## Repository map

- `backend`: Spring Boot modular monolith.
- `frontend`: placeholder for the future Next.js application.
- `database`: database model, migration, and seed documentation.
- `docs`: architecture and engineering documentation.
- `infrastructure`: Docker, PostgreSQL, Nginx, and monitoring assets.
- `scripts`: repeatable local workflows.
- `testing`: external test suites and generated reports.

See [docs/arquitectura/modular-monolith.md](docs/arquitectura/modular-monolith.md) for dependency rules.

