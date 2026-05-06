export type ResumeRunPromptProps = {
  visible: boolean;
  onResume: () => void;
  onNewRun: () => void;
  onDismiss: () => void;
};

export default function ResumeRunPrompt({
  visible,
  onResume,
  onNewRun,
  onDismiss,
}: ResumeRunPromptProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <section className="resume-run-prompt macabre-panel" aria-label="Saved run available">
      <div>
        <p className="panel-kicker">Saved run found</p>
        <strong>Resume the last settlement?</strong>
        <span>Loading starts paused so you can inspect the valley first.</span>
      </div>
      <div className="resume-run-prompt__actions">
        <button className="hud-button hud-button--primary" onClick={onResume}>Resume</button>
        <button className="hud-button" onClick={onNewRun}>New Run</button>
        <button className="hud-button" onClick={onDismiss} aria-label="Dismiss saved run prompt">Close</button>
      </div>
    </section>
  );
}
