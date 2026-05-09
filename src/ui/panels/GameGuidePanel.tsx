import { useMemo } from 'react';
import { getTutorialStep } from '../../game/tutorial/tutorial.rules';
import { player1Id, useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';

export type GameGuidePanelProps = {
  forceOpen?: boolean;
};

export default function GameGuidePanel({ forceOpen = false }: GameGuidePanelProps): JSX.Element | null {
  const guideCheckBucket = useGameStore((state) => Math.floor(state.gameState.ageOfTeeth));
  const guideOpen = useUIStore((state) => state.guideOpen);
  const setGuideOpen = useUIStore((state) => state.setGuideOpen);
  const setLeftPanel = useUIStore((state) => state.setLeftPanel);
  const step = useMemo(
    () => getTutorialStep(useGameStore.getState().gameState, player1Id),
    [guideCheckBucket]
  );

  if (!forceOpen && !guideOpen) return null;

  return (
    <section className="game-guide macabre-panel" aria-label="Game guide">
      <div className="game-guide__header">
        <div>
          <span className="panel-kicker">Guide</span>
          <h2>{step.title}</h2>
        </div>
        <button
          className="hud-button game-guide__close"
          onClick={() => {
            setGuideOpen(false);
            if (forceOpen) setLeftPanel(null);
          }}
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
