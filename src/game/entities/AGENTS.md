# AGENTS — `src/game/entities`

Applies to `src/game/entities/**`.

Parent contract: this folder is a helper/library layer, not the simulation authority.

## Local gotchas

- Keep modules pure and side-effect free; no direct store mutations or tick scheduling from entity helpers.
- New exports should be consumed via orchestrator adapters (core/economy/store call sites), not ad-hoc imports from UI components.
- Prefer data/logic separation (`*.data.ts` and `*.logic.ts`) when extending building/road/worker behavior.
