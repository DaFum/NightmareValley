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
