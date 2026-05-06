# Run Persistence Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let players save, autosave, and resume a NightmareValley run so the full Settlers-style economy flow survives refreshes and longer play sessions.

**Architecture:** Add a small persistence module with versioned JSON snapshots and defensive parsing, then wire store actions and pause-menu controls around it. Autosave is coordinated by `GameLayout` with a low-frequency interval and browser lifecycle events so the simulation loop is not blocked on every tick.

**Tech Stack:** React, TypeScript, Vite, Zustand, Jest, browser `localStorage`.

---

## File Structure

- Create: `src/store/game-save.ts`
  - Versioned save schema, serializer/parser, localStorage helpers.
- Create: `src/tests/core/game.save.test.ts`
  - Unit tests for round-trip parsing, invalid data rejection, and storage helper behavior.
- Modify: `src/store/game.store.ts`
  - Add save/load/delete/has-save actions and load snapshots into the live store.
- Modify: `src/ui/dialogs/PauseMenuDialog.tsx`
  - Add Save, Load, and Delete save controls with clear disabled states.
- Modify: `src/app/layout/GameLayout.tsx`
  - Wire pause-menu persistence actions and low-frequency autosave.
- Modify: `src/styles/ui.css`
  - Add compact persistence status styling for the pause menu.

---

## Tasks

### Task 1: Save Snapshot Module

- [x] Create `src/store/game-save.ts` with versioned snapshot helpers.
- [x] Add `src/tests/core/game.save.test.ts`.
- [x] Run focused save tests.

### Task 2: Store Actions

- [x] Extend `GameStore` with `saveGame`, `loadSavedGame`, `clearSavedGame`, and `hasSavedGame`.
- [x] Ensure loaded games resume paused and sync `activeScenario`/`tickRate`.
- [x] Run focused save tests and `npm run build`.

### Task 3: Pause Menu UI

- [x] Add Save/Load/Delete controls to `PauseMenuDialog`.
- [x] Add status copy for current saved run availability.
- [x] Style the persistence row without adding permanent HUD coverage.

### Task 4: Autosave

- [x] Add interval autosave to `GameLayout`.
- [x] Add `visibilitychange` and `beforeunload` save hooks.
- [x] Keep autosave independent of React render frequency by reading `useGameStore.getState()`.

### Task 5: Verification

- [x] Run `npx jest --runInBand src/tests/core/game.save.test.ts`.
- [x] Run `npm test -- --runInBand`.
- [x] Run `npm run build`.
- [x] Run `npm run build:vite`.
- [x] Browser sanity: save, load, delete, and autosave controls render in the pause menu.

---

## Self-Review

- Spec coverage: Adds full run persistence for long playable sessions and refresh recovery.
- Placeholder scan: No deferred tasks remain.
- Type consistency: Save helpers use `WorldState` and `GameScenarioProfile`, matching the existing store.
