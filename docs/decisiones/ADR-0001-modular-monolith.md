# ADR-0001: Start as a modular monolith

## Status

Accepted

## Decision

Agora will start as a modular monolith with business capabilities represented as top-level packages under `com.agora.modules`.

## Consequences

This keeps deployment and transactions simple while preserving explicit module boundaries that can be extracted later if operating evidence justifies it.

