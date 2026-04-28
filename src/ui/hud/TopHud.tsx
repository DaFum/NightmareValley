import { ResourceBar } from './ResourceBar';
import { PopulationBar } from './PopulationBar';
import { WorldPulseBar } from './WorldPulseBar';
import FpsCounter from './FpsCounter';
import TransportIndicator from './TransportIndicator';
import { useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';

export type TopHudProps = {
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
};

export function TopHud({ onOpenMenu, onOpenSettings }: TopHudProps) {
  const isRunning = useGameStore(state => state.isRunning);
  const tickRate = useGameStore(state => state.tickRate);
  const togglePlayPause = useGameStore(state => state.togglePlayPause);
  const setTickRate = useGameStore(state => state.setTickRate);
  const focusMode = useUIStore(state => state.focusMode);
  const minimalHud = useUIStore(state => state.minimalHud);
  const guideOpen = useUIStore(state => state.guideOpen);
  const toggleFocusMode = useUIStore(state => state.toggleFocusMode);
  const toggleMinimalHud = useUIStore(state => state.toggleMinimalHud);
  const toggleGuideOpen = useUIStore(state => state.toggleGuideOpen);

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
          <button className={`hud-button hud-button--primary ${isRunning ? 'active' : ''}`} aria-pressed={isRunning} onClick={togglePlayPause}>{isRunning ? 'Pause' : 'Play'}</button>
          <div className="hud-segment" aria-label="Simulation speed">
            <button className={`hud-button ${tickRate === 1 ? 'active' : ''}`} onClick={() => setTickRate(1)}>1x</button>
            <button className={`hud-button ${tickRate === 2 ? 'active' : ''}`} onClick={() => setTickRate(2)}>2x</button>
            <button className={`hud-button ${tickRate === 5 ? 'active' : ''}`} onClick={() => setTickRate(5)}>5x</button>
          </div>
          <button className={`hud-button ${focusMode ? 'active' : ''}`} aria-pressed={focusMode} onClick={toggleFocusMode} title="Increase world contrast">Focus</button>
          <button className={`hud-button ${minimalHud ? 'active' : ''}`} aria-pressed={minimalHud} onClick={toggleMinimalHud} title={minimalHud ? 'Show secondary HUD panels' : 'Collapse secondary HUD panels'}>{minimalHud ? 'Full HUD' : 'Minimal'}</button>
          <button className={`hud-button ${guideOpen ? 'active' : ''}`} aria-pressed={guideOpen} onClick={toggleGuideOpen} title={guideOpen ? 'Hide game guide' : 'Show game guide'}>Guide</button>
          <button className="hud-button" onClick={onOpenSettings}>Settings</button>
          <button className="hud-button" onClick={onOpenMenu}>Menu</button>
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
