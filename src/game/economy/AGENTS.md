# AGENTS — `src/game/economy`

This file applies to everything under `src/game/economy/**`.

## Intent

Keep economy/transport logic deterministic, cheap per tick, and safe under large building counts.

## Required local rules

- Prefer O(1)/O(n) heuristics in hot loops. Avoid calling full pathfinding inside `.sort()` comparators or nested scoring loops.
- Keep grid-distance semantics consistent. If you use Manhattan distance in one stage (sorting/scoring), document and align related metrics unless there is a strong reason not to.
- Preserve movement invariants in `advanceCarrierMovement`:
  - destination-tile speed model should match path-cost assumptions,
  - carry-over progress across edges must be represented in the *current edge's* units,
  - arrival detection must work for single-point and multi-edge paths.
- Use `getWorkerDefinition(...)` accessors rather than direct data-map indexing when available.
- When changing reservation, queued count, or job status transitions, ensure counters remain balanced (`queuedJobCount`, `reserved`, `delivered`).

## Testing expectations

- At minimum run:
  - `npm test -- --runInBand src/tests/core/transport.logic.test.ts`
  - `npm test -- --runInBand src/tests/core/transport.movement.test.ts`
- For broader transport behavior or balancing changes, run full suite: `npm test -- --runInBand`.

## Review checklist (economy changes)

- No new pathfinding calls in tight comparator/scoring loops.
- Movement still respects worker speed + encumbrance.
- Footfall/tier updates still happen only on boundary crossings.
- Added/updated regression tests for any changed behavior.
