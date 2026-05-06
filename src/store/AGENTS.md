# AGENTS — `src/store`

Applies to `src/store/**`.

Use store-level selectors to adapt simulation truth for UI consumption.

## Local gotchas

- Keep affordability/placement checks centralized in selector helpers; UI panels should not re-implement vault aggregation rules.
- Selectors should be read-only and deterministic (no mutations, no side effects).
- Prefer narrow selectors (single responsibility: canPlace/canAfford/canUpgrade/worker projections) over broad derived objects to limit rerender churn.
