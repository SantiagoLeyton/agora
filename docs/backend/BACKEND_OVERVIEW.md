# Agora Backend Overview

Estado: Fase 10.

Agora backend es un monolito modular en Java 21 y Spring Boot 3.5.7. Expone una API REST versionada bajo `/api/v1` para autenticacion, administracion, gestion academica, constructor de casos, simulacion determinista, bitacora, retroalimentacion e IA desacoplada con Ollama local y fallback mock.

## Principios

- La narrativa de casos es lineal.
- Las decisiones modifican estados internos, no cambian rutas narrativas.
- La IA esta desacoplada mediante el puerto `AIProvider`.
- Si el proveedor IA falla, se persiste el error y se devuelve una sintesis alternativa.
- La IA no define calificaciones academicas ni reglas de negocio.

## Modulos principales

- `auth`: login, refresh token, logout, usuario autenticado y auditoria.
- `user`: usuarios, roles y administracion.
- `academic`: grupos, estudiantes de grupo y programaciones.
- `case_management`: casos, escenas, preguntas, opciones, herramientas y entidades.
- `simulation`: intentos, respuestas, estados emocionales, bitacora y retroalimentacion.
- `ai`: sintesis academica desacoplada con `OllamaAIProvider` como proveedor principal y `MockAIProvider` como fallback.

## Persistencia

PostgreSQL es la base principal. Flyway controla el esquema con migraciones V1 a V7.

La aplicacion usa `spring.jpa.hibernate.ddl-auto=validate` fuera de tests, por lo que Hibernate no modifica el esquema en ejecucion.
