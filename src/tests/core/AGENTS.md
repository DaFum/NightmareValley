# AGENTS — `src/tests/core`

This file applies to everything under `src/tests/core/**`.

## Intent

Keep core simulation tests deterministic, focused, and easy to debug.

## Required local rules

- Prefer behavior assertions over implementation details (state transitions, counters, outputs).
- Use minimal fixtures and explicit defaults; avoid hidden coupling to global mutable state.
- If mutating shared definitions (e.g., worker stats), always restore them in `finally` blocks.
- For movement/pathing tests, encode tile tiers/positions directly in test setup so expected distances/speeds are obvious.
- Add one regression test per bug fix; name tests by user-observable behavior.

## Suggested structure

- Arrange: create compact state fixture and tiles/buildings/workers.
- Act: run one function under test.
- Assert: check the exact state deltas relevant to the scenario.

## Test command shortcuts

- Single file:
  - `npm test -- --runInBand src/tests/core/transport.logic.test.ts`
  - `npm test -- --runInBand src/tests/core/transport.movement.test.ts`
- Full core confidence:
  - `npm test -- --runInBand`
