import React from 'react';
import { useGameStore } from '../../store/game.store';

export default function TransportIndicator(): JSX.Element {
  const queued = useGameStore((state) => Object.values(state.gameState.transport.jobs).filter((job) => job.status === 'queued').length);
  const active = useGameStore((state) => Object.keys(state.gameState.transport.activeCarrierTasks).length);
  const stress = useGameStore((state) => state.gameState.transport.networkStress);

  return (
    <div className={`status-chip ${stress > 6 ? 'status-chip--warn' : ''}`} aria-label="Transport status">
      <span>Logistics</span>
      <strong>{active}/{queued}</strong>
    </div>
  );
}

