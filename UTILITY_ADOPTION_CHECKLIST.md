# Utility Adoption Checklist

Purpose: track incremental migration from ad-hoc inline helpers to canonical utilities without big-bang refactors.

## Canonical utility targets

- `src/lib/math.ts` (`clamp`, `lerp`, `approxEqual`)
- `src/lib/logger.ts` (`Logger`, `withPrefix`)
- Domain helper layers: `src/game/iso/*`, `src/game/camera/*`, `src/game/map/*`

## Incremental migration log

- [x] `src/game/map/procedural.ts`: replaced inline coordinate clamping in `walkPath` with `clamp` from `src/lib/math.ts`.
- [ ] Next nearby camera change: replace one inline bounds expression with `clamp`/shared helper.
- [ ] Next nearby iso change: replace one ad-hoc projection math duplication with canonical iso helper.

## Process rule

For each feature/fix touching map/camera/iso/lib code, migrate at least one nearby ad-hoc utility call if safe.
