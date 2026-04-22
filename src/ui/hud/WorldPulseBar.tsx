import React from 'react';
import { useGameStore } from '../../store/game.store';

export function WorldPulseBar() {
  const worldPulse = useGameStore((state) => state.gameState.worldPulse);
  const pulseRate = Math.max(40, Math.min(200, 60 + Math.floor(worldPulse * 10))); // BPM

  // Calculate animation duration based on pulse rate
  const duration = 60 / pulseRate;

  return (
    <div className="macabre-panel animate-bleed-in delay-3" style={{ padding: '16px 24px', textAlign: 'right' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--bone)',
            fontSize: '20px',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}>
            Cathedral Pulse
          </span>
          <span className="macabre-text-glow text-flicker" style={{
            color: 'var(--fresh-blood)',
            fontFamily: 'monospace',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {pulseRate} BPM
          </span>
        </div>

        {/* Beating Heart Indicator */}
        <div
          className="animate-heartbeat"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--fresh-blood) 0%, var(--coagulated-blood) 70%, transparent 100%)',
            boxShadow: '0 0 15px var(--fresh-blood)',
            animationDuration: `${duration}s`
          }}
        />
      </div>
    </div>
  );
}