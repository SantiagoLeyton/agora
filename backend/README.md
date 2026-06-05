# Agora Backend

Spring Boot modular-monolith foundation. The current phase contains technical configuration and empty module boundaries only.

Run tests:

```shell
./mvnw clean verify
```

Run locally against Docker Compose PostgreSQL:

```shell
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

