
type PauseMenuDialogProps = {
  open: boolean;
  isRunning: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClearSave: () => void;
  onClose: () => void;
  hasSavedGame: boolean;
};

export default function PauseMenuDialog({
  open,
  isRunning,
  onResume,
  onRestart,
  onOpenSettings,
  onSave,
  onLoad,
  onClearSave,
  onClose,
  hasSavedGame,
}: PauseMenuDialogProps): JSX.Element | null {
  if (!open) return null;

  return (
    <div className="game-dialog-backdrop" role="presentation">
      <section className="game-dialog game-dialog--compact macabre-panel" role="dialog" aria-modal="true" aria-labelledby="pause-dialog-title">
        <span className="game-dialog__eyebrow">Menu</span>
        <h2 id="pause-dialog-title">{isRunning ? 'Simulation Running' : 'Simulation Paused'}</h2>
        <p>Manage the current run without leaving the valley.</p>
        <div className="save-status" role="status">
          <strong>{hasSavedGame ? 'Saved run available' : 'No saved run yet'}</strong>
          <span>{hasSavedGame ? 'Load returns paused so you can inspect before resuming.' : 'Manual save and autosave use this browser.'}</span>
        </div>
        <div className="game-dialog__actions game-dialog__actions--stacked">
          <button className="hud-button hud-button--primary" onClick={onResume}>{isRunning ? 'Return' : 'Resume'}</button>
          <button className="hud-button" onClick={onSave}>Save Run</button>
          <button className="hud-button" onClick={onLoad} disabled={!hasSavedGame}>Load Saved Run</button>
          <button className="hud-button" onClick={onClearSave} disabled={!hasSavedGame}>Delete Save</button>
          <button className="hud-button" onClick={onOpenSettings}>Settings</button>
          <button className="hud-button" onClick={onRestart}>Restart Run</button>
          <button className="hud-button" onClick={onClose}>Close</button>
        </div>
      </section>
    </div>
  );
}

