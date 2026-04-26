# AGENTS — `src/game/economy`

This file applies to everything under `src/game/economy/**`.

## Intent

Keep economy/transport logic deterministic, cheap per tick, and safe under large building counts.

## Vault / warehouse model — required understanding

Before editing any economy or transport file, understand the warehouse-first logistics model:

### player.stock is a derived view
- `player.stock` is synced from all vault `outputBuffer`s by `syncStockFromVaults()`.
- It is called at the end of every `simulateTick` and immediately after `placeBuilding`/`upgradeBuilding` in `game.store.ts`.
- **Never deduct from `player.stock` directly.** Deductions must happen on vault `outputBuffer`s.
- **Never read `player.stock` for affordability decisions.** The UI aggregates vault outputBuffers directly before calling `canAffordBuilding`/`canAffordUpgrade`.

### Affordability API contract
- `canAffordBuilding(inventory: ResourceInventory, buildingType)` — accepts `ResourceInventory`, NOT `PlayerState`.
- `canAffordUpgrade(inventory: ResourceInventory, building)` — same.
- If you change either signature, update all callers: `BuildingMenu.tsx`, `BuildingInspector.tsx`, `game.store.ts`.

### Transport routing invariants
- **Production → vault (preferred):** non-vault production sources deliver to the nearest vault with remaining capacity.
- **Vault → production (preferred):** vaults deliver to production buildings that need the resource (need > 0).
- **Full vaults are excluded from preferred targets.** `getBuildingResourceNeed(b, resource, config) > 0` must hold for a vault to appear in preferred target list. Production falls back to direct production-to-production delivery when all vaults are full.
- **Vault → vault routing is forbidden.** `findTargetBuildingsForResource` must never return another vault as target when the source is a vault. Violation creates circular transport.
- Both preferred branches must also check `b.isActive` — inactive buildings are never eligible targets.

### Delivery controls
- `deliveryPriority: number` (1–5, default 3) — must be validated with `Number.isFinite` and clamped in `setDeliveryPriority`. `Math.max(1, Math.min(5, NaN))` silently returns NaN without the guard.
- `pausedInputs: Partial<Record<ResourceType, boolean>>` — per-resource delivery suspension. `buildingAcceptsResource` must check this.
- Vault buildings have a fixed +15 priority bonus in transport scoring; do not expose delivery controls UI for them.

### Buffer limits (from `balancing.constants.ts`)
| Buffer | Limit |
|--------|-------|
| Production building inputBuffer | 4 |
| Production building outputBuffer | 6 |
| Vault outputBuffer (`warehouseStorageLimit`) | 9999 |

## Required local rules

- Prefer O(1)/O(n) heuristics in hot loops. Never call full pathfinding inside `.sort()` comparators or nested scoring loops.
- Keep grid-distance semantics consistent. Manhattan distance is the canonical heuristic for routing and metrics.
- Preserve movement invariants in `advanceCarrierMovement`:
  - destination-tile speed model must match path-cost assumptions,
  - carry-over progress across edges must be represented in the current edge's units,
  - arrival detection must work for single-point and multi-edge paths.
- Use `getWorkerDefinition(...)` accessors rather than direct data-map indexing where available.
- When changing reservation, queued count, or job status transitions, ensure counters remain balanced (`queuedJobCount`, `reserved`, `delivered`).

## Additional guardrails

- Keep terminal-job handling explicit: if adding statuses, update filters/pruning/metrics logic that currently assumes `queued|claimed|delivered|lost|spilled`.
- When changing availability math (`amount`, `reserved`, pending demand), include regression tests for:
  - exact-stock assignment behavior,
  - multi-target generation capping.
- Avoid hidden global assumptions (e.g., implicit player ordering) in assignment/placement logic; prefer explicit ids or guarded fallbacks.
- When changing `findTargetBuildingsForResource` or `getBuildingResourceNeed`, run both transport.logic test suites.

## Testing expectations

Always run after any economy/transport change:
```bash
npm test -- --runInBand src/tests/core/transport.logic.test.ts
npm test -- --runInBand src/tests/core/transport.movement.test.ts
npm test -- --runInBand src/tests/core/economy.simulation.test.ts
```

For broader balancing or routing changes, run full suite:
```bash
npm test -- --runInBand
```

### Required regression tests when changing:
| Change | Required test coverage |
|--------|----------------------|
| `findTargetBuildingsForResource` routing | vault-first preference, full-vault fallback, no vault-to-vault |
| `canAffordBuilding` / `canAffordUpgrade` | accepts ResourceInventory, not PlayerState |
| `syncStockFromVaults` | aggregates multiple vaults, preserves stock when no vaults |
| `placeBuilding` / `upgradeBuilding` | deducts from vault outputBuffer, falls back to player.stock |
| Availability math (`amount`, `reserved`) | exact-stock assignment, multi-target cap |

## Review checklist (economy changes)

- No new pathfinding calls in tight comparator/scoring loops.
- Movement still respects worker speed + encumbrance.
- Footfall/tier updates still happen only on boundary crossings.
- Added/updated regression tests for any changed behavior.
- Queued/claimed counters remain non-negative and status transitions are balanced.
- `player.stock` not used as the source of truth for affordability checks.
- Vault-to-vault transport not introduced.
- Full-vault fallback still allows production-to-production delivery.
