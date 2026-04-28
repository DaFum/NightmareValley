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
  { key: '?', label: 'Open command reference', action: 'openShortcutHelp' },
  { key: 'Esc', label: 'Close dialogs or cancel current tool', action: 'cancelOrClose' },
];

export function isEditableHotkeyTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;
  const element = target as Partial<HTMLElement>;
  if (element.isContentEditable) return true;
  if (typeof element.tagName !== 'string') return false;

  const tagName = element.tagName.toLowerCase();
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
