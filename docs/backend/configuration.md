# Backend configuration

The backend uses `application.yml` for common defaults and profile-specific files for `dev`, `test`, and `prod`.

- `dev`: local PostgreSQL from Docker Compose, verbose SQL diagnostics.
- `test`: isolated in-memory H2 database for context and architecture tests.
- `prod`: environment-only database credentials and conservative observability exposure.

Secrets must be supplied through environment variables. They must never be committed.

`JWT_SECRET` must be Base64 or Base64URL encoded and decode to at least 32 bytes.
The `dev` profile provides a local fallback secret only to keep developer startup simple.
Production deployments must always inject a private `JWT_SECRET` value.

