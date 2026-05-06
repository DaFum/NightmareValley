# AGENTS — `src/lib`

Applies to `src/lib/**`.

Parent architecture rules apply; this folder is shared utility infrastructure.

## Local gotchas

- Keep helpers framework-agnostic (no React/Pixi/store imports) so they remain reusable from simulation and UI layers.
- Prefer extending existing primitives (`clamp`, `lerp`, logger helpers) over introducing one-off inline math/object utilities in call sites.
- When replacing ad-hoc logic with a canonical helper, preserve behavior first and keep refactors small (single nearby call-site migration per feature change is preferred).
