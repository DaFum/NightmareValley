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
        <div className="macabre-panel animate-bleed-in" style={{ padding: '16px', minWidth: '300px' }}>
          <h2 className="macabre-text-glow text-flicker" style={{ margin: '0 0 12px 0', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--fresh-blood)', fontFamily: 'var(--font-display)' }}>Imperial Coffers</h2>
          <ResourceBar />
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--coagulated-blood)' }}>
             <PopulationBar />
          </div>
        </div>
      </div>

      {/* Right side: World Pulse */}
      <div style={{ pointerEvents: 'auto' }}>
        <div className="macabre-panel animate-bleed-in delay-2" style={{ padding: '16px', minWidth: '250px' }}>
          <h2 className="macabre-text-glow" style={{ margin: '0 0 12px 0', fontSize: '20px', letterSpacing: '1px', color: 'var(--bone)', fontFamily: 'var(--font-display)' }}>Pulse of the World</h2>
          <WorldPulseBar />
        </div>
      </div>
    </div>
  );
}