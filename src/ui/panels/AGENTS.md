# AGENTS — UI panels scope

Follow root UI/economy styling rules.

## Local gotchas

- Prefer narrow Zustand selectors (with shallow comparison when needed) for debug/economy panels to avoid full-state rerenders.
- For transport diagnostics, choose meaningful source buildings (vault/producer context) rather than arbitrary same-owner picks.
