import { useGameStore } from '../../store/game.store';

export function WorldPulseBar() {
  const worldPulse = useGameStore((state) => state.gameState.worldPulse);
  const pulseRate = Math.max(40, Math.min(200, 60 + Math.floor(worldPulse * 10))); // BPM

  // Calculate animation duration based on pulse rate
  const duration = 60 / pulseRate;

  return (
    <div className="world-pulse">
      <div>
        <span>Cathedral Pulse</span>
        <strong>{pulseRate} BPM</strong>
      </div>
      <i className="animate-heartbeat" style={{ animationDuration: `${duration}s` }} aria-hidden="true" />
    </div>
  );
}
