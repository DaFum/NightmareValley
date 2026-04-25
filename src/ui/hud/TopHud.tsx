import React, { useEffect, useState } from 'react';
import { ResourceBar } from './ResourceBar';
import { PopulationBar } from './PopulationBar';
import { WorldPulseBar } from './WorldPulseBar';
import FpsCounter from './FpsCounter';
import TransportIndicator from './TransportIndicator';
import { useGameStore } from '../../store/game.store';

export function TopHud() {
  const isRunning = useGameStore(state => state.isRunning);
  const tickRate = useGameStore(state => state.tickRate);
  const togglePlayPause = useGameStore(state => state.togglePlayPause);
  const setTickRate = useGameStore(state => state.setTickRate);

  const [focusMode, setFocusMode] = useState<boolean>(() => {
    try { return !!localStorage.getItem('ui:focus'); } catch { return false; }
  });

  const [minimalHud, setMinimalHud] = useState<boolean>(() => {
    try { return !!localStorage.getItem('ui:minimalHud'); } catch { return false; }
  });

  useEffect(() => {
    document.body.classList.toggle('ui--focus', focusMode);
    try { if (focusMode) localStorage.setItem('ui:focus', '1'); else localStorage.removeItem('ui:focus'); } catch {}
  }, [focusMode]);

  useEffect(() => {
    document.body.classList.toggle('ui--minimal', minimalHud);
    try { if (minimalHud) localStorage.setItem('ui:minimalHud', '1'); else localStorage.removeItem('ui:minimalHud'); } catch {}
  }, [minimalHud]);

  useEffect(() => {
    try { localStorage.removeItem('ui:hudHidden'); } catch {}
  }, []);

  return (
    <div className="top-hud-container">
      <div className="top-hud-inner">
        <section className="macabre-panel hud-panel top-hud__economy" aria-label="Settlement economy">
          <div className="top-hud__label">
            <span className="top-hud__kicker">Imperial Coffers</span>
            <ResourceBar />
          </div>
          <PopulationBar />
        </section>

        <nav className="hud-controls" aria-label="Game controls">
          <button className={`hud-button hud-button--primary ${isRunning ? 'active' : ''}`} onClick={togglePlayPause}>{isRunning ? 'Pause' : 'Play'}</button>
          <div className="hud-segment" aria-label="Simulation speed">
            <button className={`hud-button ${tickRate === 1 ? 'active' : ''}`} onClick={() => setTickRate(1)}>1x</button>
            <button className={`hud-button ${tickRate === 2 ? 'active' : ''}`} onClick={() => setTickRate(2)}>2x</button>
            <button className={`hud-button ${tickRate === 5 ? 'active' : ''}`} onClick={() => setTickRate(5)}>5x</button>
          </div>
          <button className={`hud-button ${focusMode ? 'active' : ''}`} onClick={() => setFocusMode(s => !s)} title="Increase world contrast">Focus</button>
          <button className={`hud-button ${minimalHud ? 'active' : ''}`} onClick={() => setMinimalHud(s => !s)} title="Collapse secondary HUD panels">{minimalHud ? 'Full HUD' : 'Minimal'}</button>
          <FpsCounter />
          <TransportIndicator />
        </nav>

        <section className="macabre-panel hud-panel top-hud__pulse" aria-label="World pulse">
          <span className="top-hud__kicker">Pulse of the World</span>
          <WorldPulseBar />
        </section>
      </div>
    </div>
  );
}
