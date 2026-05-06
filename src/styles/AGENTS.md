# AGENTS — styles scope

Follow root styling and economy color-token rules from the repository AGENTS.

## Local gotchas
- Mobile overrides must match base layout primitives: for grid-based panels, collapse with `grid-template-columns` (not flex-only properties).
- Keep breakpoint behavior stable across debug/economy/panel UIs by editing grouped media-query selectors together when they share panel width/collapse behavior.
