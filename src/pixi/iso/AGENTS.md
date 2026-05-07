# AGENTS — `src/pixi/iso`

Applies to `src/pixi/iso/**`.

This adapter layer centralizes Pixi-facing access to shared iso helpers.

## Local gotchas

- Keep tile/screen conversion wrappers parameter-light by sourcing canonical ISO constants internally.
- Expose only adapter-level primitives used by hooks/layers (hit tests, transforms, diamond geometry).
- Do not re-implement projection math here; delegate to `src/game/iso/*` helpers.
