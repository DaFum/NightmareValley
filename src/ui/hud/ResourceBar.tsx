import React from 'react';
import { useGameStore } from '../../store/game.store';

import { useShallow } from 'zustand/react/shallow';

export function ResourceBar() {
  // Try to use real data from the store, but fall back to thematic placeholder if store structure isn't ready

  const teeth = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.toothPlanks ?? 0;
    return 0;
  });
  const marrow = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.marrowGrain ?? 0;
    return 0;
  });
  const bile = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.amnioticWater ?? 0;
    return 0;
  });
  const loaf = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.funeralLoaf ?? 0;
    return 0;
  });
  const dust = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.boneDust ?? 0;
    return 0;
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
            {teeth}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--marrow)', fontSize: '18px' }}>Marrow Grain</span>
          <span style={{ color: 'var(--marrow)', fontFamily: 'monospace', fontSize: '18px' }}>
            {marrow}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--bone)', fontSize: '18px' }}>Bone Dust</span>
          <span style={{ color: 'var(--bone)', fontFamily: 'monospace', fontSize: '18px' }}>
            {dust}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--bile)', fontSize: '18px' }}>Amniotic Bile</span>
          <span style={{ color: 'var(--bile)', fontFamily: 'monospace', fontSize: '18px' }}>
            {bile}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--flesh)', fontSize: '18px' }}>Funeral Loaf</span>
          <span style={{ color: 'var(--flesh)', fontFamily: 'monospace', fontSize: '18px' }}>
            {loaf}
          </span>
        </div>
      </div>
    </div>
  );
}
