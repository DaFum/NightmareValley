import { useMemo } from 'react';
import { getTutorialStep } from '../../game/tutorial/tutorial.rules';
import { player1Id, useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';

export default function GameGuidePanel(): JSX.Element | null {
  const gameState = useGameStore((state) => state.gameState);
  const guideOpen = useUIStore((state) => state.guideOpen);
  const setGuideOpen = useUIStore((state) => state.setGuideOpen);
  const step = useMemo(() => getTutorialStep(gameState, player1Id), [gameState]);

  if (!guideOpen) return null;

  return (
    <section className="game-guide macabre-panel" aria-label="Game guide">
      <div className="game-guide__header">
        <div>
          <span className="panel-kicker">Guide</span>
          <h2>{step.title}</h2>
        </div>
        <button
          className="hud-button game-guide__close"
          onClick={() => setGuideOpen(false)}
          title="Hide guide"
          aria-label="Hide guide"
        >
          Close
        </button>
      </div>
      <p>{step.body}</p>
      <strong>{step.action}</strong>
    </section>
  );
}
