# AGENTS — `src/game/entities/workers`

Applies to `src/game/entities/workers/**`.

Follow parent entities rules; this subtree separates transition logic from derived helpers.

## Local gotchas

- Keep worker state transitions orchestrated via simulation tick entrypoints; avoid direct UI/store mutation paths.
- Use `worker.derived.ts` for pure positional/derived checks that other systems may share.
- Treat `worker.jobs.ts` mutation helpers as legacy/deprecated; do not add new runtime call sites.
