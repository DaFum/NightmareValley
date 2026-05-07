# AGENTS — `src/game/ai`

Applies to `src/game/ai/**`.

Follow parent simulation determinism rules.

## Local gotchas

- AI action scoring must be deterministic for identical world state (no hidden randomness in priority scoring).
- Keep telemetry payloads stable and compact so UI/debug consumers can diff decisions tick-to-tick.
