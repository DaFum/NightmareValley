# AGENTS — `src/tests/core`

This file applies to everything under `src/tests/core/**`.

## Intent

Keep core simulation tests deterministic, focused, and easy to debug.

## Test files in this directory

| File | What it covers |
|------|----------------|
| `economy.simulation.test.ts` | `syncStockFromVaults` aggregation, vault deduction on `placeBuilding`/`upgradeBuilding`, player.stock fallback |
| `transport.logic.test.ts` | Routing (vault-first preference, full-vault fallback, no vault-to-vault), distance tiebreaker, job batching, job pruning, carrier job selection |
| `transport.movement.test.ts` | Carrier movement, speed tiers, arrival detection, path carry-over |
| `building.placement.test.ts` | Tile validation, ownership, terrain |
| `footfall.test.ts` | Footfall decay and tier thresholds |
| `pathfinding.test.ts` | A* correctness |

## Required local rules

- Prefer behavior assertions over implementation details (state transitions, counters, outputs).
- Use minimal fixtures and explicit defaults; avoid hidden coupling to global mutable state.
- If mutating shared definitions (e.g., worker stats), always restore them in `finally` blocks.
- For movement/pathing tests, encode tile tiers/positions directly in test setup so expected distances/speeds are obvious.
- Add one regression test per bug fix; name tests by user-observable behavior.

## Vault / warehouse regression tests

These scenarios must have explicit test coverage. Add a test if any of the following behaviors change:

| Behavior | Where covered |
|----------|--------------|
| `syncStockFromVaults` aggregates multiple vault outputBuffers | `economy.simulation.test.ts` |
| `syncStockFromVaults` preserves player.stock when no vaults exist | `economy.simulation.test.ts` |
| `placeBuilding` deducts from vault outputBuffer when vault exists | `economy.simulation.test.ts` |
| `placeBuilding` falls back to player.stock when no vault exists | `economy.simulation.test.ts` |
| `upgradeBuilding` deducts from vault outputBuffer | `economy.simulation.test.ts` |
| Vault-first routing: production → vault preferred over production | `transport.logic.test.ts` |
| Full-vault fallback: mill reachable when all vaults at capacity | `transport.logic.test.ts` |
| No vault-to-vault routing | `transport.logic.test.ts` |

## Affordability API test patterns

`canAffordBuilding` and `canAffordUpgrade` accept `ResourceInventory`, not `PlayerState`. When testing these functions:
- Pass a plain `ResourceInventory` object (or an aggregated vault outputBuffer mock), not a full player fixture.
- Verify that the functions return `true`/`false` based on the provided inventory, not on `player.stock`.

Example fixture pattern:
```typescript
const inventory: ResourceInventory = { toothPlanks: 10, sepulcherStone: 5 } as ResourceInventory;
expect(canAffordBuilding(inventory, 'organHarvester')).toBe(true);
```

## Suggested structure

- **Arrange:** create compact state fixture with only the fields needed by the function under test.
- **Act:** call exactly one function under test.
- **Assert:** check only the state deltas relevant to the scenario.

## Test quality guidelines

- Prefer assertions that reflect player-visible outcomes (delivered jobs, placement allowed/blocked, tier changes).
- When fixing a bug, include one test that would fail on the old behavior and pass on the new behavior.
- Keep fixtures compact: include only fields required by the function under test to reduce brittleness.
- Name tests by behavior and condition (e.g., `"does not count candidate job against itself when source has exact stock"`).
- For vault deduction tests: assert the exact `outputBuffer` values after the operation, not just that the operation succeeded.

## Test command shortcuts

```bash
# Single files
npm test -- --runInBand src/tests/core/transport.logic.test.ts
npm test -- --runInBand src/tests/core/transport.movement.test.ts
npm test -- --runInBand src/tests/core/economy.simulation.test.ts

# Full core confidence
npm test -- --runInBand
```
