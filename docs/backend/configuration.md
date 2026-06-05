# Backend configuration

The backend uses `application.yml` for common defaults and profile-specific files for `dev`, `test`, and `prod`.

- `dev`: local PostgreSQL from Docker Compose, verbose SQL diagnostics.
- `test`: isolated in-memory H2 database for context and architecture tests.
- `prod`: environment-only database credentials and conservative observability exposure.

Secrets must be supplied through environment variables. They must never be committed.

