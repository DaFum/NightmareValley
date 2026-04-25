# AGENTS — `src/pixi/layers`

This file applies to everything under `src/pixi/layers/**`.

## Intent

Keep layer rendering predictable in Pixi v7+, with explicit draw intent and low per-frame overhead.

## Required local rules

- Prefer `eventMode` and avoid deprecated interactive APIs.
- When filling repeated tile shapes, ensure each shape is a closed path (e.g., `drawPolygon([...])`) to avoid fill artifacts.
- Minimize state changes in draw callbacks (`beginFill`, `lineStyle`, etc.) by batching where possible.
- Keep layer z-index semantics stable; if changed, document visible impact.
- Avoid silent rendering fallbacks. If a tier/asset case is unknown, skip clearly or log intentionally in non-hot paths.

## Performance notes

- Draw functions run frequently; avoid allocations inside deep loops when easy to avoid.
- Group by bucket/color/alpha when possible to reduce draw calls.

## Layer-edit checklist

- Confirm layer ordering (`zIndex`, render order) still matches intended visual stacking.
- Verify pointer interaction scope is minimal (only interactive display objects get `eventMode`).
- Prefer shared constants for tile geometry/depth over hardcoded numbers in layer code.
- If adding debug visuals, ensure they can be toggled and do not run expensive logic in production paths.

## Validation

- For visual logic updates, verify in dev (`npm run dev`) and include a screenshot when tooling is available.
- For logic-only layer changes, run related tests plus `npm run build:vite`.
