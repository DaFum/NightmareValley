import { useMemo } from 'react';
import { createEconomySnapshot } from '../../game/economy/economy.snapshot';
import { useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';
import type { ResourceType } from '../../game/core/economy.types';

const DEBUG_RESOURCE: ResourceType = 'sinewTimber';

export default function DebugLogisticsPanel() {
  const isDebugSpawningWarehouse = useUIStore(state => state.isDebugSpawningWarehouse);
  const setDebugSpawningWarehouse = useUIStore(state => state.setDebugSpawningWarehouse);
  const showFootfallHeatmap = useUIStore(state => state.showFootfallHeatmap);
  const toggleFootfallHeatmap = useUIStore(state => state.toggleFootfallHeatmap);

  const gameState = useGameStore(state => state.gameState);
  const snapshot = useMemo(() => createEconomySnapshot(gameState), [gameState]);
  const totalFootfall = useMemo(
    () => Object.values(gameState.territory.tiles).reduce((sum, t) => sum + t.footfall, 0),
    [gameState.territory.tiles],
  );
  const totalStoredResources = Object.values(snapshot.totalStoredResources).reduce((sum, amount) => sum + (amount ?? 0), 0);

  const dispatchDebugJobsFromHQ = useGameStore(state => state.dispatchDebugJobsFromHQ);
  const resetFootfall = useGameStore(state => state.resetFootfall);

  return (
    <div className="macabre-panel" style={{ padding: '1rem', color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid #ff0000', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ff4444' }}>Logistics Debug</h3>
      <div style={{ fontSize: '0.9rem' }}>
        <div>Tick: {snapshot.tick}</div>
        <div>Buildings: {snapshot.totalBuildings}</div>
        <div>Workers: {snapshot.totalWorkers}</div>
        <div>Active Tasks: {snapshot.activeCarrierTasks}</div>
        <div>Queued Jobs: {snapshot.queuedJobs}</div>
        <div>World Pulse: {Math.round(snapshot.worldPulse)}</div>
        <div>Stored Resources: {Math.round(totalStoredResources)}</div>
        <div>Total Footfall: {Math.round(totalFootfall)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => setDebugSpawningWarehouse(!isDebugSpawningWarehouse)}
          style={{ backgroundColor: isDebugSpawningWarehouse ? '#ff4444' : '#333', color: 'white', padding: '0.5rem', border: '1px solid #555', cursor: 'pointer' }}
        >
          {isDebugSpawningWarehouse ? 'Cancel Spawn' : 'Spawn warehouse at cursor'}
        </button>
        <button
          onClick={() => dispatchDebugJobsFromHQ(10, DEBUG_RESOURCE)}
          style={{ backgroundColor: '#333', color: 'white', padding: '0.5rem', border: '1px solid #555', cursor: 'pointer' }}
        >
          {`Dispatch 10 ${DEBUG_RESOURCE}`}
        </button>
        <button
          onClick={resetFootfall}
          style={{ backgroundColor: '#333', color: 'white', padding: '0.5rem', border: '1px solid #555', cursor: 'pointer' }}
        >
          Reset footfall
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
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
