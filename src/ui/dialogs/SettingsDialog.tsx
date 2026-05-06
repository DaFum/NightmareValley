
import { useState } from 'react';
import { GameScenarioProfile } from '../../store/game.store';
import { useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';

type SettingsDialogProps = {
  open: boolean;
  activeScenario: GameScenarioProfile;
  onScenarioChange: (profile: GameScenarioProfile) => void;
  onClose: () => void;
};

const scenarioOptions: Array<{ value: GameScenarioProfile; label: string; description: string }> = [
  { value: 'sandbox', label: 'Sandbox', description: 'Generous stockpiles for relaxed building.' },
  { value: 'challenging', label: 'Challenging', description: 'Balanced starting supplies and normal pressure.' },
  { value: 'hardcore', label: 'Hardcore', description: 'Lean supplies for a stricter opening.' },
];

const speedOptions = [
  { value: 1, label: '1x', description: 'Precise placement and inspection.' },
  { value: 2, label: '2x', description: 'Balanced settlement growth.' },
  { value: 5, label: '5x', description: 'Fast production testing.' },
];

export default function SettingsDialog({
  open,
  activeScenario,
  onScenarioChange,
  onClose,
}: SettingsDialogProps): JSX.Element | null {
  const tickRate = useGameStore((state) => state.tickRate);
  const setTickRate = useGameStore((state) => state.setTickRate);
  const isRunning = useGameStore((state) => state.isRunning);
  const setRunning = useGameStore((state) => state.setRunning);
  const resetGame = useGameStore((state) => state.resetGame);
  const focusMode = useUIStore((state) => state.focusMode);
  const minimalHud = useUIStore((state) => state.minimalHud);
  const setFocusMode = useUIStore((state) => state.setFocusMode);
  const setMinimalHud = useUIStore((state) => state.setMinimalHud);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!open) return null;

  const handleScenarioChange = (profile: GameScenarioProfile) => {
    setConfirmReset(false);
    onScenarioChange(profile);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetGame(activeScenario);
    setConfirmReset(false);
  };

  return (
    <div className="game-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="game-dialog game-dialog--wide macabre-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="game-dialog__eyebrow">Settings</span>
        <h2 id="settings-dialog-title">Run Setup</h2>
        <p>Scenario, speed, and interface settings apply immediately to the current run.</p>

        <div className="settings-grid">
          <section className="settings-block" aria-labelledby="settings-scenario-title">
            <h3 id="settings-scenario-title">Scenario</h3>
            <div className="settings-list">
              {scenarioOptions.map((option) => (
                <button
                  key={option.value}
                  className={`settings-option ${activeScenario === option.value ? 'active' : ''}`}
                  onClick={() => handleScenarioChange(option.value)}
                  aria-pressed={activeScenario === option.value}
                >
                  <span>{option.label}</span>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="settings-block" aria-labelledby="settings-speed-title">
            <h3 id="settings-speed-title">Simulation</h3>
            <div className="settings-list">
              <button
                className={`settings-option ${isRunning ? 'active' : ''}`}
                onClick={() => setRunning(!isRunning)}
                aria-pressed={isRunning}
              >
                <span>{isRunning ? 'Running' : 'Paused'}</span>
                <small>{isRunning ? 'Pause the world clock.' : 'Resume production, transport, and workers.'}</small>
              </button>
              {speedOptions.map((option) => (
                <button
                  key={option.value}
                  className={`settings-option ${tickRate === option.value ? 'active' : ''}`}
                  onClick={() => setTickRate(option.value)}
                  aria-pressed={tickRate === option.value}
                >
                  <span>{option.label}</span>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="settings-block" aria-labelledby="settings-interface-title">
            <h3 id="settings-interface-title">Interface</h3>
            <div className="settings-list">
              <button
                className={`settings-option ${focusMode ? 'active' : ''}`}
                onClick={() => setFocusMode(!focusMode)}
                aria-pressed={focusMode}
              >
                <span>Focus Contrast</span>
                <small>Brighten the world layer and reduce texture noise.</small>
              </button>
              <button
                className={`settings-option ${minimalHud ? 'active' : ''}`}
                onClick={() => setMinimalHud(!minimalHud)}
                aria-pressed={minimalHud}
              >
                <span>Minimal HUD</span>
                <small>Hide secondary panels while keeping core controls available.</small>
              </button>
            </div>
          </section>

          <section className="settings-block" aria-labelledby="settings-run-title">
            <h3 id="settings-run-title">Run</h3>
            <div className="settings-list">
              <button className={`settings-option settings-option--danger ${confirmReset ? 'active' : ''}`} onClick={handleReset}>
                <span>{confirmReset ? 'Confirm Restart' : 'Restart Current Scenario'}</span>
                <small>{confirmReset ? 'Click again to reset buildings, workers, stock, and transport.' : 'Prepare a fresh run with the selected scenario.'}</small>
              </button>
            </div>
          </section>
        </div>

        <div className="game-dialog__actions">
          <button className="hud-button hud-button--primary" onClick={onClose}>Done</button>
        </div>
      </section>
    </div>
  );
}

