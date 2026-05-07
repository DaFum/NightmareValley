# AGENTS — `src/game/entities/roads`

Applies to `src/game/entities/roads/**`.

Follow parent entity-layer rules and keep runtime entry points centralized.

## Local gotchas

- Export recommended runtime entry points via `road.api.ts`; treat lower-level helper modules as internal building blocks.
- Keep validation and render-shape decisions consistent by routing runtime call sites through one façade import path.
