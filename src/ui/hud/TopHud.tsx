import React from 'react';
import { ResourceBar } from './ResourceBar';
import { PopulationBar } from './PopulationBar';
import { WorldPulseBar } from './WorldPulseBar';
import { useGameStore } from '../../store/game.store';

export function TopHud() {
  const isRunning = useGameStore(state => state.isRunning);
  const tickRate = useGameStore(state => state.tickRate);
  const togglePlayPause = useGameStore(state => state.togglePlayPause);
  const setTickRate = useGameStore(state => state.setTickRate);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      padding: '24px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      pointerEvents: 'none',
      boxSizing: 'border-box',
      zIndex: 100
    }}>
      {/* Left side: Resources */}
      <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ResourceBar />
        <PopulationBar />
      </div>

      {/* Center Controls: Play/Pause/Speed */}
      <div style={{ pointerEvents: 'auto', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '4px' }}>
        <button
          onClick={togglePlayPause}
          style={{ cursor: 'pointer', background: '#333', color: '#fff', border: '1px solid #555', padding: '4px 8px' }}
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => setTickRate(1)}
          style={{ cursor: 'pointer', background: tickRate === 1 ? '#555' : '#333', color: '#fff', border: '1px solid #555', padding: '4px 8px' }}
        >
          1x
        </button>
        <button
          onClick={() => setTickRate(2)}
          style={{ cursor: 'pointer', background: tickRate === 2 ? '#555' : '#333', color: '#fff', border: '1px solid #555', padding: '4px 8px' }}
        >
          2x
        </button>
        <button
          onClick={() => setTickRate(5)}
          style={{ cursor: 'pointer', background: tickRate === 5 ? '#555' : '#333', color: '#fff', border: '1px solid #555', padding: '4px 8px' }}
        >
          5x
        </button>
      </div>

      {/* Right side: World Pulse */}
      <div style={{ pointerEvents: 'auto' }}>
        <WorldPulseBar />
      </div>
    </div>
  );
}
