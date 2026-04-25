import { useGameStore } from '../../store/game.store';

import { useShallow } from 'zustand/react/shallow';

export function PopulationBar() {
  const population = useGameStore(useShallow((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) {
      const player = state.gameState.players[playerIds[0]];
      return {
        active: player.workers.length,
        max: player.populationLimit,
      };
    }
    return { active: 13, max: 20 };
  }));
  const { active, max } = population;
  const maxSafe = Number.isFinite(max) ? Math.max(max, 0) : 0;
  const fill = maxSafe > 0 ? Math.min(Math.max((active / maxSafe) * 100, 0), 100) : 0;

  return (
    <div className="population-chip" aria-label="Population">
      <span>Souls</span>
      <strong>{active}<small>/{maxSafe}</small></strong>
      <div className="population-chip__track">
        <div className="population-chip__fill" style={{ width: `${fill}%` }} />
      </div>
    </div>
  );
}
