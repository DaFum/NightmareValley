
import { GameOutcome } from '../../game/core/victory.rules';

type VictoryDialogProps = {
  outcome: GameOutcome;
  onContinue?: () => void;
  onRestart?: () => void;
};

export default function VictoryDialog({ outcome, onContinue, onRestart }: VictoryDialogProps): JSX.Element | null {
  if (outcome.kind === 'in-progress') return null;

  return (
    <div className="game-dialog-backdrop" role="presentation">
      <section className="game-dialog macabre-panel" role="dialog" aria-modal="true" aria-labelledby="victory-dialog-title">
        <span className={`game-dialog__eyebrow game-dialog__eyebrow--${outcome.kind}`}>
          {outcome.kind === 'victory' ? 'Victory' : 'Defeat'}
        </span>
        <h2 id="victory-dialog-title">{outcome.title}</h2>
        <p>{outcome.summary}</p>
        {outcome.score ? (
          <div className="game-dialog__score" aria-label="Scenario score">
            <strong>{outcome.score.total}</strong>
            <span>score</span>
            <small>{outcome.score.completionTimeSec}s completion · {Math.round(outcome.score.logisticsEfficiency)} logistics</small>
          </div>
        ) : null}
        <div className="game-dialog__objectives">
          {outcome.objectives.map((objective) => (
            <div key={objective.id} className={objective.complete ? 'complete' : ''}>
              <span>{objective.chapter}: {objective.label}</span>
              <strong>{Math.min(objective.current, objective.target)}/{objective.target}</strong>
              {objective.complete ? <small>{objective.reward}</small> : null}
            </div>
          ))}
        </div>
        <div className="game-dialog__actions">
          {outcome.kind === 'victory' && (
            <button className="hud-button" onClick={onContinue}>Continue</button>
          )}
          <button className="hud-button hud-button--primary" onClick={onRestart}>Restart</button>
        </div>
      </section>
    </div>
  );
}

