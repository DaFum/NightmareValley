import { useMemo } from 'react';
import { useGameStore, player1Id } from '../../store/game.store';
import { getTransportIndicatorModel } from '../../store/transportIndicatorDomain';

export default function TransportIndicator(): JSX.Element {
  const gameState = useGameStore((state) => state.gameState);
  const model = useMemo(() => getTransportIndicatorModel(gameState, player1Id), [gameState]);

  const className = [
    'status-chip',
    `status-chip--${model.tone}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={className} aria-label={`Transport status: ${model.title}`} title={model.title}>
      <span>Logistics</span>
      <strong>{model.summary}</strong>
      <small>{model.headline}</small>
    </div>
  );
}

