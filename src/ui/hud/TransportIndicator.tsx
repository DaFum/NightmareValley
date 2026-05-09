import { useMemo } from 'react';
import { useGameStore, player1Id } from '../../store/game.store';
import { getLogisticsSummaryModel } from '../../store/logisticsDomain';

export default function TransportIndicator(): JSX.Element {
  const gameState = useGameStore((state) => state.gameState);
  const model = useMemo(() => getLogisticsSummaryModel(gameState, player1Id), [gameState]);

  const className = [
    'status-chip',
    `status-chip--${model.tone}`,
  ].filter(Boolean).join(' ');

  const summary = `Active ${model.activeJobs} · Queued ${model.queuedJobs}`;
  const title = `${model.headline}: ${model.whyIdle} ${model.recommendation}`;

  return (
    <div className={className} aria-label={`Transport status: ${title}`} title={title}>
      <span>Logistics</span>
      <strong>{summary}</strong>
      <small>{model.whyIdle}</small>
    </div>
  );
}

