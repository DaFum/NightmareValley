import React from 'react';
import { useGameStore } from '../../store/game.store';

const TRANSPORT_STRESS_WARN_THRESHOLD = 6;

export default function TransportIndicator(): JSX.Element {
  const queued = useGameStore((state) => state.gameState.transport.queuedJobCount ?? 0);
  const active = useGameStore((state) => Object.keys(state.gameState.transport.activeCarrierTasks).length);
  const stress = useGameStore((state) => state.gameState.transport.networkStress);

  const className = [
    'status-chip',
    stress > TRANSPORT_STRESS_WARN_THRESHOLD ? 'status-chip--warn' : null
  ].filter(Boolean).join(' ');

  return (
    <div className={className} aria-label="Transport status">
      <span>Logistics</span>
      <strong>Active {active} &middot; Queued {queued}</strong>
    </div>
  );
}

