import React from 'react';
import { useGameStore } from '../../store/game.store';

export function PopulationBar() {
  const population = useGameStore((state: any) => state.population) || { active: 13, max: 20, idle: 2 };

  return (
    <div className="macabre-panel animate-bleed-in delay-2" style={{ padding: '12px 24px', minWidth: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--flesh)',
          fontSize: '22px',
          letterSpacing: '1px'
        }}>
          Souls Bound
        </span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span className="text-flicker" style={{ color: 'var(--bone)', fontFamily: 'monospace', fontSize: '24px', fontWeight: 'bold' }}>
            {population.active ?? 13}
          </span>
          <span style={{ color: 'rgba(227, 220, 211, 0.4)', fontFamily: 'monospace', fontSize: '16px' }}>/</span>
          <span style={{ color: 'var(--coagulated-blood)', fontFamily: 'monospace', fontSize: '18px' }}>
            {population.max ?? 20}
          </span>
        </div>
      </div>

      {/* Progress Bar resembling a vein */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'var(--void-shadow)',
        marginTop: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${((population.active ?? 13) / (population.max ?? 20)) * 100}%`,
          backgroundColor: 'var(--fresh-blood)',
          boxShadow: '0 0 8px var(--fresh-blood)'
        }} />
      </div>
    </div>
  );
}