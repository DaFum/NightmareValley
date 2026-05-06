# AGENTS — `src/game/core`

Applies to `src/game/core/**`.

Follow root economy/tick-flow rules; this folder defines canonical simulation primitives consumed by the store tick.

## Local gotchas

- Treat exported functions here as **authoritative simulation APIs**; avoid adding convenience wrappers that bypass `game.store` orchestration.
- Keep functions deterministic for a given input/state (no hidden `Date.now()`/`Math.random()` usage without injected RNG from `random.ts`).
- If adding a new exported function, ensure it is wired into runtime orchestrators (`game.store`/simulation callers) and covered by a core test.
