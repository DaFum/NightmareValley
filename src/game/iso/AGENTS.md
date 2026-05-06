# AGENTS — `src/game/iso`

Applies to `src/game/iso/**`.

Parent contract: this folder provides geometry/projection helpers consumed through adapters.

## Local gotchas

- Keep coordinate transforms stateless and reversible where applicable (`project`/`inverse` pairs).
- Reuse shared constants from `iso.constants.ts`; do not duplicate tile dimension magic numbers in helper modules.
- Avoid Pixi/DOM dependencies in this layer so helpers remain testable as pure math utilities.
