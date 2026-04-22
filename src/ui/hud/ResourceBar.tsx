import React from 'react';
import { useGameStore } from '../../store/game.store';

export function ResourceBar() {
  const player = useGameStore(state => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]];
    return undefined;
  });

  const resources = {
    teeth: player?.stock.toothPlanks ?? 666,
    marrow: player?.stock.marrowGrain ?? 42,
    bile: player?.stock.amnioticWater ?? 13,
  };

  return (
    <div className="macabre-panel animate-bleed-in delay-1" style={{ padding: '16px 24px', minWidth: '280px' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        margin: '0 0 12px 0',
        color: 'var(--fresh-blood)',
        fontSize: '28px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        borderBottom: '1px solid var(--coagulated-blood)',
        paddingBottom: '8px'
      }}>
        Tithe Collected
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--bone)', fontSize: '18px', fontWeight: 'bold' }}>Teeth</span>
          <span className="macabre-text-glow" style={{ color: 'var(--bone)', fontFamily: 'monospace', fontSize: '20px' }}>
            {resources.teeth ?? 666}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--marrow)', fontSize: '18px' }}>Marrow</span>
          <span style={{ color: 'var(--marrow)', fontFamily: 'monospace', fontSize: '18px' }}>
            {resources.marrow ?? 42}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--bile)', fontSize: '18px' }}>Bile</span>
          <span style={{ color: 'var(--bile)', fontFamily: 'monospace', fontSize: '18px' }}>
            {resources.bile ?? 13}
          </span>
        </div>
      </div>
    </div>
  );
}
