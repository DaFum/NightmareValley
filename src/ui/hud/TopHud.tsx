import React, { useEffect, useState } from 'react';
import { ResourceBar } from './ResourceBar';
import { PopulationBar } from './PopulationBar';
import { WorldPulseBar } from './WorldPulseBar';
import { useGameStore } from '../../store/game.store';

export function TopHud() {
  const isRunning = useGameStore(state => state.isRunning);
  const tickRate = useGameStore(state => state.tickRate);
  const togglePlayPause = useGameStore(state => state.togglePlayPause);
  const setTickRate = useGameStore(state => state.setTickRate);

  const [focusMode, setFocusMode] = useState<boolean>(() => {
    try { return !!localStorage.getItem('ui:focus'); } catch { return false; }
  });

  const [hudHidden, setHudHidden] = useState<boolean>(() => {
    try { return !!localStorage.getItem('ui:hudHidden'); } catch { return false; }
  });

  useEffect(() => {
    document.body.classList.toggle('ui--focus', focusMode);
    try { if (focusMode) localStorage.setItem('ui:focus', '1'); else localStorage.removeItem('ui:focus'); } catch {}
  }, [focusMode]);

  useEffect(() => {
    document.body.classList.toggle('hud-hidden', hudHidden);
    try { if (hudHidden) localStorage.setItem('ui:hudHidden', '1'); else localStorage.removeItem('ui:hudHidden'); } catch {}
  }, [hudHidden]);

  return (
    <div className="top-hud-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
      <div className="top-hud-inner">
        {/* Left side: Resources */}
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="macabre-panel animate-bleed-in hud-panel">
            <h2 className="macabre-text-glow text-flicker hud-title">Imperial Coffers</h2>
            <ResourceBar />
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--coagulated-blood)' }}>
              <PopulationBar />
            </div>
          </div>
        </div>

        {/* Center Controls: Play/Pause/Speed + UI toggles */}
        <div style={{ pointerEvents: 'auto' }}>
          <div className="hud-controls">
            <button className={`hud-button ${isRunning ? 'active' : ''}`} onClick={togglePlayPause}>{isRunning ? 'Pause' : 'Play'}</button>
            <button className={`hud-button ${tickRate === 1 ? 'active' : ''}`} onClick={() => setTickRate(1)}>1x</button>
            <button className={`hud-button ${tickRate === 2 ? 'active' : ''}`} onClick={() => setTickRate(2)}>2x</button>
            <button className={`hud-button ${tickRate === 5 ? 'active' : ''}`} onClick={() => setTickRate(5)}>5x</button>

            <div style={{ width: 12 }} />
            <div className="hud-toggle">
              <button className={`hud-button ${focusMode ? 'active' : ''}`} onClick={() => setFocusMode(s => !s)} title="Focus world (increase contrast)">Focus</button>
              <button className={`hud-button ${hudHidden ? 'active' : ''}`} onClick={() => setHudHidden(s => !s)} title="Hide HUD for unobstructed view">Hide HUD</button>
            </div>
          </div>
        </div>

        {/* Right side: World Pulse */}
        <div style={{ pointerEvents: 'auto' }}>
          <div className="macabre-panel animate-bleed-in delay-2 hud-panel">
            <h2 className="macabre-text-glow hud-title">Pulse of the World</h2>
            <WorldPulseBar />
          </div>
        </div>
      </div>
    </div>
  );
}
