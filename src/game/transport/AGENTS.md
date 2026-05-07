# AGENTS — `src/game/transport`

This scope is the transport extraction boundary from `src/game/economy/transport.logic.ts`.

- Keep `src/game/transport/index.ts` as the only migration entrypoint for transport consumers.
- During extraction, preserve behavior parity with economy transport tests after each moved concern.
- Do not introduce parallel implementations for the same concern; if a module is scaffold-only, it must not contain shadow logic.
- For shared transport invariants (vault-first routing, no vault→vault, queue/reservation balance), follow the parent `src/game/economy/AGENTS.md` rules.
