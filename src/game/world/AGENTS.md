# AGENTS — world tick scope

Follow root AGENTS economy ownership and stock-sync rules.

## Local gotchas

- Keep AI owner resolution stable: use `player1Id` (or explicit runtime owner IDs), never insertion-order player lookups.
- Any `placeBuilding`/`upgradeBuilding` mutation in world tick paths must immediately run `syncStockFromVaults` before returning state.
