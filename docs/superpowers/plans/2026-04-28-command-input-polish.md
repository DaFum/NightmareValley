# Command Input Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make NightmareValley easier to play end to end by adding complete keyboard command flow, a compact shortcut reference, and HUD wiring that keeps the isometric playfield readable.

**Architecture:** Add a small pure hotkey resolver that maps keyboard events to game commands, test it independently, then wire it into `GameLayout` as the single command coordinator. Add a DOM dialog for shortcut reference and extend the existing HUD controls instead of adding more permanent panels.

**Tech Stack:** React, TypeScript, Vite, Zustand, Jest, Pixi canvas with DOM HUD overlays.

---

## File Structure

- Create: `src/ui/hotkeys/gameHotkeys.ts`
  - Pure command mapping, editable-target detection, and shortcut metadata for UI.
- Create: `src/tests/core/game.hotkeys.test.ts`
  - Unit coverage for shortcut resolution and editable target safety.
- Create: `src/ui/dialogs/ShortcutHelpDialog.tsx`
  - Compact accessible dialog listing player commands.
- Modify: `src/app/layout/GameLayout.tsx`
  - Add shortcut dialog state and global keydown command dispatch.
- Modify: `src/ui/hud/TopHud.tsx`
  - Add a `Keys` button that opens the shortcut dialog.
- Modify: `src/styles/ui.css`
  - Add shortcut dialog layout and responsive polish.
- Modify: `docs/superpowers/plans/2026-04-28-command-input-polish.md`
  - Mark tasks complete as implementation proceeds.

---

### Task 1: Hotkey Command Resolver

**Files:**
- Create: `src/ui/hotkeys/gameHotkeys.ts`
- Test: `src/tests/core/game.hotkeys.test.ts`

- [x] **Step 1: Write the hotkey resolver test**

Create `src/tests/core/game.hotkeys.test.ts`:

```ts
import { getGameHotkeyAction, isEditableHotkeyTarget } from '../../ui/hotkeys/gameHotkeys';

function eventFor(key: string, target?: Partial<HTMLElement>, extra: Partial<KeyboardEvent> = {}) {
  return {
    key,
    target: target ?? { tagName: 'DIV' },
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...extra,
  } as KeyboardEvent;
}

describe('gameHotkeys', () => {
  it('maps core gameplay keys to command actions', () => {
    expect(getGameHotkeyAction(eventFor(' '))).toBe('togglePlayPause');
    expect(getGameHotkeyAction(eventFor('b'))).toBe('toggleBuildMenu');
    expect(getGameHotkeyAction(eventFor('B'))).toBe('toggleBuildMenu');
    expect(getGameHotkeyAction(eventFor('r'))).toBe('toggleRoadBuild');
    expect(getGameHotkeyAction(eventFor('x'))).toBe('toggleRoadRemove');
    expect(getGameHotkeyAction(eventFor('g'))).toBe('toggleGuide');
    expect(getGameHotkeyAction(eventFor('m'))).toBe('toggleMinimalHud');
    expect(getGameHotkeyAction(eventFor('?'))).toBe('openShortcutHelp');
    expect(getGameHotkeyAction(eventFor('Escape'))).toBe('cancelOrClose');
  });

  it('ignores modified browser and text-editing shortcuts', () => {
    expect(getGameHotkeyAction(eventFor('b', { tagName: 'DIV' }, { ctrlKey: true }))).toBeNull();
    expect(getGameHotkeyAction(eventFor('r', { tagName: 'INPUT' }))).toBeNull();
    expect(getGameHotkeyAction(eventFor('g', { tagName: 'TEXTAREA' }))).toBeNull();
    expect(getGameHotkeyAction(eventFor('m', { tagName: 'DIV', isContentEditable: true }))).toBeNull();
  });

  it('detects editable targets defensively', () => {
    expect(isEditableHotkeyTarget({ tagName: 'INPUT' } as HTMLElement)).toBe(true);
    expect(isEditableHotkeyTarget({ tagName: 'SELECT' } as HTMLElement)).toBe(true);
    expect(isEditableHotkeyTarget({ tagName: 'BUTTON' } as HTMLElement)).toBe(false);
    expect(isEditableHotkeyTarget(null)).toBe(false);
  });
});
```

- [x] **Step 2: Run test to verify it fails before implementation**

Run: `npx jest --runInBand src/tests/core/game.hotkeys.test.ts`

Expected: FAIL because `src/ui/hotkeys/gameHotkeys.ts` does not exist yet.

- [x] **Step 3: Implement the resolver**

Create `src/ui/hotkeys/gameHotkeys.ts`:

```ts
export type GameHotkeyAction =
  | 'togglePlayPause'
  | 'toggleBuildMenu'
  | 'toggleRoadBuild'
  | 'toggleRoadRemove'
  | 'toggleGuide'
  | 'toggleMinimalHud'
  | 'openShortcutHelp'
  | 'cancelOrClose';

export type ShortcutDefinition = {
  key: string;
  label: string;
  action: GameHotkeyAction;
};

export const GAME_SHORTCUTS: ShortcutDefinition[] = [
  { key: 'Space', label: 'Play or pause simulation', action: 'togglePlayPause' },
  { key: 'B', label: 'Open or close building catalog', action: 'toggleBuildMenu' },
  { key: 'R', label: 'Toggle road building mode', action: 'toggleRoadBuild' },
  { key: 'X', label: 'Toggle road removal mode', action: 'toggleRoadRemove' },
  { key: 'G', label: 'Show or hide guide', action: 'toggleGuide' },
  { key: 'M', label: 'Toggle minimal HUD', action: 'toggleMinimalHud' },
  { key: '?', label: 'Open this command reference', action: 'openShortcutHelp' },
  { key: 'Esc', label: 'Close dialogs or cancel current tool', action: 'cancelOrClose' },
];

export function isEditableHotkeyTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
}

export function getGameHotkeyAction(event: KeyboardEvent): GameHotkeyAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey || isEditableHotkeyTarget(event.target)) {
    return null;
  }

  const key = event.key.toLowerCase();
  if (event.key === ' ') return 'togglePlayPause';
  if (event.key === 'Escape') return 'cancelOrClose';
  if (key === 'b') return 'toggleBuildMenu';
  if (key === 'r') return 'toggleRoadBuild';
  if (key === 'x') return 'toggleRoadRemove';
  if (key === 'g') return 'toggleGuide';
  if (key === 'm') return 'toggleMinimalHud';
  if (event.key === '?' || (event.key === '/' && event.shiftKey)) return 'openShortcutHelp';
  return null;
}
```

- [x] **Step 4: Run resolver tests**

Run: `npx jest --runInBand src/tests/core/game.hotkeys.test.ts`

Expected: PASS.

---

### Task 2: Shortcut Help Dialog

**Files:**
- Create: `src/ui/dialogs/ShortcutHelpDialog.tsx`
- Modify: `src/styles/ui.css`

- [x] **Step 1: Create the dialog component**

Create `src/ui/dialogs/ShortcutHelpDialog.tsx`:

```tsx
import { GAME_SHORTCUTS } from '../hotkeys/gameHotkeys';

export type ShortcutHelpDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function ShortcutHelpDialog({ open, onClose }: ShortcutHelpDialogProps) {
  if (!open) return null;

  return (
    <div className="game-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="game-dialog game-dialog--compact shortcut-dialog macabre-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dialog-header">
          <div>
            <p className="panel-kicker">Command reference</p>
            <h2 id="shortcut-dialog-title">Keyboard Controls</h2>
          </div>
          <button className="hud-button" onClick={onClose}>Close</button>
        </header>

        <dl className="shortcut-list">
          {GAME_SHORTCUTS.map((shortcut) => (
            <div className="shortcut-row" key={shortcut.action}>
              <dt><kbd>{shortcut.key}</kbd></dt>
              <dd>{shortcut.label}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
```

- [x] **Step 2: Add dialog CSS**

Append to `src/styles/ui.css`:

```css
.shortcut-dialog {
  width: min(32rem, calc(100vw - 2rem));
}

.shortcut-list {
  display: grid;
  gap: 0.45rem;
  margin: 1rem 0 0;
}

.shortcut-row {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  background: rgba(8, 10, 14, 0.42);
}

.shortcut-row kbd {
  display: inline-flex;
  min-width: 3.25rem;
  justify-content: center;
  padding: 0.25rem 0.45rem;
  border: 1px solid var(--button-border);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-strong);
  font: 700 0.78rem var(--font-ui);
}

.shortcut-row dd {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.35;
}
```

---

### Task 3: Layout and HUD Wiring

**Files:**
- Modify: `src/app/layout/GameLayout.tsx`
- Modify: `src/ui/hud/TopHud.tsx`

- [x] **Step 1: Wire shortcut button into TopHud**

Modify `TopHudProps` and add the button before Settings:

```tsx
export type TopHudProps = {
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
};
```

```tsx
<button className="hud-button" onClick={onOpenShortcuts} title="Show keyboard controls">Keys</button>
```

- [x] **Step 2: Add global hotkey dispatch in GameLayout**

Import:

```tsx
import ShortcutHelpDialog from '../../ui/dialogs/ShortcutHelpDialog';
import { getGameHotkeyAction } from '../../ui/hotkeys/gameHotkeys';
import { useSelectionStore } from '../../store/selection.store';
```

Add state/actions and effect:

```tsx
const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
const togglePlayPause = useGameStore((state) => state.togglePlayPause);
const togglePanel = useUIStore((state) => state.togglePanel);
const toggleRoadPlacementMode = useUIStore((state) => state.toggleRoadPlacementMode);
const toggleRoadRemovalMode = useUIStore((state) => state.toggleRoadRemovalMode);
const toggleGuideOpen = useUIStore((state) => state.toggleGuideOpen);
const toggleMinimalHud = useUIStore((state) => state.toggleMinimalHud);
const selectBuildingToPlace = useUIStore((state) => state.selectBuildingToPlace);
const setRoadPlacementMode = useUIStore((state) => state.setRoadPlacementMode);
const setRoadRemovalMode = useUIStore((state) => state.setRoadRemovalMode);
const clearSelection = useSelectionStore((state) => state.clearSelection);
```

```tsx
React.useEffect(() => {
  const onKeyDown = (event: KeyboardEvent) => {
    const action = getGameHotkeyAction(event);
    if (!action) return;
    event.preventDefault();

    if (action === 'togglePlayPause') togglePlayPause();
    else if (action === 'toggleBuildMenu') togglePanel('buildingMenu');
    else if (action === 'toggleRoadBuild') toggleRoadPlacementMode();
    else if (action === 'toggleRoadRemove') toggleRoadRemovalMode();
    else if (action === 'toggleGuide') toggleGuideOpen();
    else if (action === 'toggleMinimalHud') toggleMinimalHud();
    else if (action === 'openShortcutHelp') setShortcutsOpen(true);
    else if (action === 'cancelOrClose') {
      if (shortcutsOpen) setShortcutsOpen(false);
      else if (settingsOpen) setSettingsOpen(false);
      else if (menuOpen) setMenuOpen(false);
      else {
        selectBuildingToPlace(null);
        setRoadPlacementMode(false);
        setRoadRemovalMode(false);
        clearSelection();
      }
    }
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}, [
  clearSelection,
  menuOpen,
  selectBuildingToPlace,
  setRoadPlacementMode,
  setRoadRemovalMode,
  settingsOpen,
  shortcutsOpen,
  toggleGuideOpen,
  toggleMinimalHud,
  togglePanel,
  togglePlayPause,
  toggleRoadPlacementMode,
  toggleRoadRemovalMode,
]);
```

Render `ShortcutHelpDialog` inside the existing `Suspense` block.

- [x] **Step 3: Run TypeScript build**

Run: `npm run build`

Expected: PASS.

---

### Task 4: Verification

**Files:**
- All modified files above.

- [x] **Step 1: Run focused tests**

Run: `npx jest --runInBand src/tests/core/game.hotkeys.test.ts`

Expected: PASS.

- [x] **Step 2: Run full unit suite**

Run: `npm test -- --runInBand`

Expected: PASS.

- [x] **Step 3: Run production builds**

Run: `npm run build`

Expected: PASS.

Run: `npm run build:vite`

Expected: PASS, with only the existing large asset chunk warning if present.

- [x] **Step 4: Manual browser sanity**

Start preview with `npm run preview -- --host 127.0.0.1 --port 4176`, open `/game`, and verify:

- `?` opens the keyboard dialog.
- `Esc` closes dialogs or cancels active tools.
- `B`, `R`, `X`, `G`, `M`, and `Space` perform their listed actions.
- Text fields in Settings still receive typed input without triggering game commands.

---

## Self-Review

- Spec coverage: This plan continues the playable game work by improving complete command flow and UI/UX without expanding permanent HUD coverage.
- Placeholder scan: No placeholder tasks or unspecified tests remain.
- Type consistency: `GameHotkeyAction`, `GAME_SHORTCUTS`, and all imported store actions match current repository naming.
