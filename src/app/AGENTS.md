# AGENTS — `src/app`

Applies to `src/app/**`.

Follow root routing and DEV-gating rules; keep app-shell behavior deterministic across HMR.

## Local gotchas

- Keep route-level DEV gating centralized through `src/app/devFeatures.ts`; avoid scattering raw `__DEV__` checks across route/layout files.
- Any history API patching must remain idempotent across HMR reloads (persist patch guards on `window`, not module-local state).
- Preserve SSR-safe guards (`typeof window === 'undefined'`) for route/path helpers used during initial render.
