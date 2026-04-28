# Playability UX Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make NightmareValley easier to learn, more readable while playing, and more robust under visual QA without changing the vault-first economy contract.

**Architecture:** Add thin UI/UX systems around the existing simulation rather than rewriting economy logic. Keep first-run guidance, contextual actions, alerts, and visual QA in focused files under `src/ui`, `src/store`, `src/game/tutorial`, and `scripts`, with tests for deterministic derivation logic.

**Tech Stack:** React, TypeScript, Vite, Zustand, Pixi.js, Jest, Playwright/CDP screenshots.

---

## Design Direction

- **Fantasy:** oppressive isometric settlement-builder, but operational UI must stay readable and player-first.
- **HUD rule:** normal play shows compact status and one active guidance surface; long codex/economy detail stays collapsed.
- **Player verbs:** build production chains, place roads, staff buildings, inspect bottlenecks, survive events, finish campaign chapters.
- **Responsive rule:** desktop keeps the map center visible; mobile turns dense panels into drawers/chips.
- **Asset rule:** generate or add assets only when a missing visual state is user-facing; keep text UI code-native.

## File Responsibility Map

- `src/game/tutorial/tutorial.rules.ts`: deterministic onboarding/current-step derivation from game state.
- `src/tests/core/tutorial.rules.test.ts`: regression tests for onboarding and next-step messaging.
- `src/ui/panels/GameGuidePanel.tsx`: compact first-run/always-available guide with action hints.
- `src/store/ui.store.ts`: persistent guide visibility and tutorial dismissal state.
- `src/app/layout/GameLayout.tsx`: wire guide into the bottom dock and keep it compatible with minimal HUD.
- `src/ui/hud/TopHud.tsx`: add a readable Help/Guide toggle.
- `src/ui/panels/BuildingMenu.tsx`: surface tool-state hints for build/road/remove modes.
- `src/ui/panels/EventLogPanel.tsx`: promote severe recent events into concise alert copy.
- `src/ui/panels/EconomyPanel.tsx`: add top actionable bottleneck CTA copy without expanding the panel footprint.
- `src/styles/ui.css`: guide panel, alert, and compact control polish.
- `scripts/playwright-screenshots.mjs`: make desktop/mobile screenshot capture exit reliably.
- `docs/superpowers/plans/2026-04-28-playability-ux-expansion.md`: track this plan.

## Extended ToDo List

### Phase 1: First Five Minutes

- [x] Add deterministic tutorial step rules for: build quarry, build well, place roads, staff missing workers, produce food, produce tools.
- [x] Add `GameGuidePanel` with current step, why it matters, and one concise action hint.
- [x] Add persistent Help/Guide toggle in `TopHud`.
- [x] Add tests for tutorial step progression against seeded game states.

### Phase 2: Tool Feedback and HUD Weight

- [x] Add build/road/remove mode helper text to `BuildingMenu`.
- [x] Collapse nonessential bottom-dock panels by default when `minimalHud` is enabled.
- [x] Ensure desktop screenshots keep the central playfield readable with default HUD state.
- [x] Ensure mobile controls do not overflow horizontally at 390px width.

### Phase 3: Alerts and Actionable Bottlenecks

- [x] Promote the newest warning/critical event into a compact alert strip.
- [x] Add top bottleneck action copy to `EconomyPanel`.
- [x] Add readable status labels for road-disconnected and missing-worker blockers where the player can act.
- [x] Add tests for event severity sorting and bottleneck action derivation if logic moves out of components.

### Phase 4: Visual QA Reliability

- [x] Fix `scripts/playwright-screenshots.mjs` so it exits after overview/mobile captures.
- [x] Capture desktop and mobile screenshots from production preview.
- [x] Record any deliberate visual limitations in the final QA notes.
- [x] Keep generated screenshots out of git.

### Phase 5: Content and Asset Finish

- [x] Audit manifest and codex for every building, worker, and resource entry.
- [x] Add missing small UI/status icons only where current text-only states are hard to scan.
- [x] Ensure new assets are referenced by `src/assets/spritesheets/manifest.json`.
- [x] Run manifest existence tests after any asset change.

### Phase 6: Tactical Map Readability

- [x] Add a compact minimap that summarizes terrain, ownership, buildings, roads, and active carriers.
- [x] Keep the minimap in the left HUD slot on desktop and collapse it cleanly on mobile/minimal HUD.
- [x] Add deterministic tests for minimap projection, bounds, and status counts.
- [x] Verify the new map surface with unit tests and production build.

## Execution Order

1. Implement tutorial derivation and tests.
2. Wire the guide panel and Help toggle.
3. Polish tool feedback and minimal HUD behavior.
4. Add alert/bottleneck action copy.
5. Repair screenshot workflow and run visual QA.
6. Audit content/assets and run full verification.

## Verification Commands

```bash
npm test -- --runInBand src/tests/core/tutorial.rules.test.ts
npm test -- --runInBand src/tests/core/economy.planner.test.ts src/tests/core/world.events.test.ts
npm test -- --runInBand
npm run build
npm run build:vite
npm run screenshot:playwright
```

## Plan Self-Review

- No new gameplay system violates the warehouse/vault invariants.
- The plan prioritizes player guidance and UI clarity over risky simulation rewrites.
- Each phase can ship independently and be tested with deterministic state or screenshots.
- The scope is intentionally smaller than the previous full-gameplay plan so implementation can continue safely in the current dirty worktree.
