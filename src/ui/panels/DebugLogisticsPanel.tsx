import { useEffect, useMemo } from 'react';
import { createEconomySnapshot } from '../../game/economy/economy.snapshot';
import { useGameStore } from '../../store/game.store';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../store/ui.store';
import type { ResourceType } from '../../game/core/economy.types';
import { profileSync } from '../../lib/profiler';

const DEBUG_RESOURCE: ResourceType = 'sinewTimber';

export default function DebugLogisticsPanel() {
  const isDebugSpawningWarehouse = useUIStore(state => state.isDebugSpawningWarehouse);
  const setDebugSpawningWarehouse = useUIStore(state => state.setDebugSpawningWarehouse);
  const showFootfallHeatmap = useUIStore(state => state.showFootfallHeatmap);
  const toggleFootfallHeatmap = useUIStore(state => state.toggleFootfallHeatmap);

  const gameState = useGameStore(
    useShallow((state) => {
      return {
        tick: state.gameState.tick,
        ageOfTeeth: state.gameState.ageOfTeeth,
        players: state.gameState.players,
        buildings: state.gameState.buildings,
        workers: state.gameState.workers,
        territory: state.gameState.territory,
        transport: state.gameState.transport,
        worldPulse: state.gameState.worldPulse,
      };
    }),
  );
  const snapshot = useMemo(() => createEconomySnapshot(gameState), [gameState]);
  const totalFootfall = useMemo(
    () => Object.values(gameState.territory.tiles).reduce((sum, t) => sum + t.footfall, 0),
    [gameState.territory.tiles],
  );
  const totalStoredResources = Object.values(snapshot.totalStoredResources).reduce((sum, amount) => sum + (amount ?? 0), 0);

  useEffect(() => {
    profileSync('debug.snapshot', () => createEconomySnapshot(gameState), { log: false });
    profileSync('debug.footfall', () => Object.values(gameState.territory.tiles).reduce((sum, t) => sum + t.footfall, 0), { log: false });
  }, [gameState]);

  const dispatchDebugJobsFromHQ = useGameStore(state => state.dispatchDebugJobsFromHQ);
  const resetFootfall = useGameStore(state => state.resetFootfall);

  return (
    <div className="macabre-panel debug-logistics-panel">
      <h3 className="debug-logistics-panel__title">Logistics Debug</h3>
      <div className="debug-logistics-panel__stats">
        <div>Tick: {snapshot.tick}</div>
        <div>Buildings: {snapshot.totalBuildings}</div>
        <div>Workers: {snapshot.totalWorkers}</div>
        <div>Active Tasks: {snapshot.activeCarrierTasks}</div>
        <div>Queued Jobs: {snapshot.queuedJobs}</div>
        <div>World Pulse: {Math.round(snapshot.worldPulse)}</div>
        <div>Stored Resources: {Math.round(totalStoredResources)}</div>
        <div>Total Footfall: {Math.round(totalFootfall)}</div>
      </div>
      <div className="debug-logistics-panel__actions">
        <button
          onClick={() => setDebugSpawningWarehouse(!isDebugSpawningWarehouse)}
          className={[
            'debug-logistics-panel__button',
            isDebugSpawningWarehouse ? 'debug-logistics-panel__button--active' : '',
          ].filter(Boolean).join(' ')}
        >
          {isDebugSpawningWarehouse ? 'Cancel Spawn' : 'Spawn warehouse at cursor'}
        </button>
        <button
          onClick={() => dispatchDebugJobsFromHQ(10, DEBUG_RESOURCE)}
          className="debug-logistics-panel__button"
        >
          {`Dispatch 10 ${DEBUG_RESOURCE}`}
        </button>
        <button
          onClick={resetFootfall}
          className="debug-logistics-panel__button"
        >
          Reset footfall
        </button>
        <label className="debug-logistics-panel__checkbox">
          <input
            type="checkbox"
            aria-label="Show footfall heatmap"
            checked={showFootfallHeatmap}
            onChange={toggleFootfallHeatmap}
          />
          Show footfall heatmap
        </label>
      </div>
    </div>
  );
}
