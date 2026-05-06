# AGENTS — `src/pixi`

Applies to `src/pixi/**` unless overridden by deeper AGENTS files.

## Local gotchas

- Keep coordinate conversion and hit-testing routed through `src/pixi/iso/iso.adapter.ts` instead of wiring raw iso helpers/constants in components.
- `GameStage` should orchestrate interaction state only; avoid embedding domain affordability/placement rules directly.
- Prefer deterministic render-layer inputs derived from store selectors/facades to prevent UI/simulation divergence.
