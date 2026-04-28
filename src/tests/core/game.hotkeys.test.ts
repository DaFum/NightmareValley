import { getGameHotkeyAction, isEditableHotkeyTarget } from '../../ui/hotkeys/gameHotkeys';

function eventFor(key: string, target?: Partial<HTMLElement>, extra: Partial<KeyboardEvent> = {}) {
  return {
    key,
    target: target ?? { tagName: 'DIV' },
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
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
    expect(getGameHotkeyAction(eventFor('/', { tagName: 'DIV' }, { shiftKey: true }))).toBe('openShortcutHelp');
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
