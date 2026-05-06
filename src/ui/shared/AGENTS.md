# AGENTS — shared UI components scope

Follow root accessibility and styling conventions.

## Local gotchas

- Keep semantic element prop types aligned with rendered elements (e.g., `<section>` should not use `HTMLDivElement` props).
- Avoid generic repeated landmark names on reusable containers; pair titles with `aria-labelledby` when present.
