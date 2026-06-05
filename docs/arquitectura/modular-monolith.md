# Modular monolith

Agora starts as a modular monolith. Each package under `com.agora.modules` owns a future business capability and must not depend on another module's internal implementation.

## Dependency direction

- Modules may use stable contracts deliberately exposed by other modules when those contracts are introduced.
- Modules may depend on `shared` for genuinely cross-cutting, domain-neutral code.
- `config`, `security`, and `infrastructure` provide application-level technical concerns.
- `shared` must not depend on business modules.
- Circular dependencies between modules are forbidden and checked by ArchUnit.

## Current modules

- `auth`
- `user`
- `academic`
- `case_management`
- `simulation`
- `feedback`
- `ai`

The packages are intentionally empty of domain implementation in this phase.

