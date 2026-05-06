# AGENTS — roads rendering scope

Follow root Pixi compatibility guidance.

## Local gotchas
- Treat road terrain keys as exact canonical keys; avoid substring checks on `textureKey`.
- Reuse shared road geometry constants (`road.constants.ts`) so sprite and segment polygons stay visually aligned.
