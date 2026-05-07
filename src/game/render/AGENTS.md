# AGENTS — `src/game/render`

Applies to `src/game/render/**`.

Follow parent render-contract guidance.

## Local gotchas

- `render.adapter.ts` is the canonical mapping boundary from simulation state to iso render state.
- Avoid adding UI-layer conditionals to adapter output; keep output fixture-friendly for snapshot tests.
