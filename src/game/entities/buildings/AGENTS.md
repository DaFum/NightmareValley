# AGENTS — `src/game/entities/buildings`

Applies to `src/game/entities/buildings/**`.

Follow parent entity-layer rules; this folder keeps compatibility adapters thin.

## Local gotchas

- Deprecated compatibility APIs (`building.placement.ts`, `building.upgrades.ts`) must be pass-through adapters to authoritative simulation/economy functions.
- Avoid introducing new state authority here; this module should not diverge from `src/game/core` and `src/game/economy` behavior.
