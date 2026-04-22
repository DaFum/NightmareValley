import React from 'react';
import { ResourceBar } from './ResourceBar';
import { PopulationBar } from './PopulationBar';
import { WorldPulseBar } from './WorldPulseBar';

export function TopHud() {
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

      {/* Right side: World Pulse */}
      <div style={{ pointerEvents: 'auto' }}>
        <WorldPulseBar />
      </div>
    </div>
  );
}