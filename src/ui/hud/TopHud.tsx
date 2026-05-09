import { ResourceBar } from './ResourceBar';
import { PopulationBar } from './PopulationBar';
import { WorldPulseBar } from './WorldPulseBar';
import FpsCounter from './FpsCounter';
import TransportIndicator from './TransportIndicator';
import { useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';
import { getSimulationStatusModel } from '../../store/simulationStatusDomain';

export type TopHudProps = {
  onOpenMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
};

export function TopHud({ onOpenMenu, onOpenSettings, onOpenShortcuts }: TopHudProps) {
  const isRunning = useGameStore(state => state.isRunning);
  const tickRate = useGameStore(state => state.tickRate);
  const togglePlayPause = useGameStore(state => state.togglePlayPause);
  const setTickRate = useGameStore(state => state.setTickRate);
  const focusMode = useUIStore(state => state.focusMode);
  const minimalHud = useUIStore(state => state.minimalHud);
  const leftPanel = useUIStore(state => state.leftPanel);
  const setLeftPanel = useUIStore(state => state.setLeftPanel);
  const toggleFocusMode = useUIStore(state => state.toggleFocusMode);
  const toggleMinimalHud = useUIStore(state => state.toggleMinimalHud);
  const toggleGuideOpen = useUIStore(state => state.toggleGuideOpen);
  const hudDensityLabel = minimalHud ? 'HUD Minimal' : 'HUD Full';
  const hudDensityTitle = minimalHud ? 'Show secondary HUD panels' : 'Collapse secondary HUD panels';
  const hudDensityAriaLabel = `${hudDensityLabel}. ${hudDensityTitle}`;
  const simulationStatus = getSimulationStatusModel(isRunning, tickRate);

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
          <div className={`status-chip status-chip--${isRunning ? 'good' : 'warn'} status-chip--simulation`} title={simulationStatus.tooltip} aria-label={simulationStatus.tooltip}>
            <span>Simulation</span>
            <strong>{simulationStatus.label}</strong>
            <small>Space toggles pause</small>
          </div>
          <button
            className={`hud-button hud-button--primary ${simulationStatus.pausePressed ? 'active' : ''}`}
            aria-pressed={simulationStatus.pausePressed}
            aria-label={simulationStatus.pauseAriaLabel}
            title={simulationStatus.pauseAriaLabel}
            onClick={togglePlayPause}
          >
            {simulationStatus.pauseLabel}
          </button>
          <div className="hud-segment" aria-label="Simulation speed">
            {[1, 2, 4].map((rate) => (
              <button
                key={rate}
                className={`hud-button ${tickRate === rate ? 'active' : ''}`}
                onClick={() => setTickRate(rate)}
                aria-pressed={tickRate === rate}
                aria-label={simulationStatus.speedAriaLabels[rate as 1 | 2 | 4]}
                title={simulationStatus.speedAriaLabels[rate as 1 | 2 | 4]}
              >
                {rate}x
              </button>
            ))}
          </div>
          <button className={`hud-button ${focusMode ? 'active' : ''}`} aria-pressed={focusMode} onClick={toggleFocusMode} title="Increase world contrast">Focus</button>
          <button className={`hud-button ${minimalHud ? 'active' : ''}`} aria-pressed={minimalHud} aria-label={hudDensityAriaLabel} onClick={toggleMinimalHud} title={hudDensityTitle}>{hudDensityLabel}</button>
          <button
            className={`hud-button ${leftPanel === 'guide' ? 'active' : ''}`}
            aria-pressed={leftPanel === 'guide'}
            onClick={() => {
              toggleGuideOpen();
              setLeftPanel(leftPanel === 'guide' ? null : 'guide');
            }}
            title="Show game guide in the left rail"
          >
            Guide
          </button>
          <button className="hud-button" onClick={onOpenShortcuts} title="Show keyboard controls">Keys</button>
          <button className="hud-button" onClick={onOpenSettings}>Settings</button>
          <button className="hud-button" onClick={onOpenMenu}>Menu</button>
          <FpsCounter />
          <TransportIndicator />
          <div className="status-chip status-chip--pulse" aria-label="World pulse" title="World pulse tempo and raid rhythm">
            <span>Pulse</span>
            <WorldPulseBar />
          </div>
        </nav>
      </div>
    </div>
  );
}
