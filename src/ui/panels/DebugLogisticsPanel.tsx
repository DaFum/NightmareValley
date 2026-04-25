import React from 'react';
import { useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';
import type { ResourceType } from '../../game/core/economy.types';

const DEBUG_RESOURCE: ResourceType = 'sinewTimber';

export default function DebugLogisticsPanel() {
  const isDebugSpawningWarehouse = useUIStore(state => state.isDebugSpawningWarehouse);
  const setDebugSpawningWarehouse = useUIStore(state => state.setDebugSpawningWarehouse);
  const showFootfallHeatmap = useUIStore(state => state.showFootfallHeatmap);
  const toggleFootfallHeatmap = useUIStore(state => state.toggleFootfallHeatmap);

  const activeCarrierTasksCount = useGameStore(state => Object.keys(state.gameState.transport.activeCarrierTasks).length);
  const queuedJobsCount = useGameStore(state => state.gameState.transport.queuedJobCount ?? 0);
  const totalFootfall = useGameStore(state => Object.values(state.gameState.territory.tiles).reduce((sum, t) => sum + t.footfall, 0));

  const dispatchDebugJobsFromHQ = useGameStore(state => state.dispatchDebugJobsFromHQ);
  const resetFootfall = useGameStore(state => state.resetFootfall);

  return (
    <div className="macabre-panel" style={{ padding: '1rem', color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid #ff0000', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ff4444' }}>Logistics Debug</h3>
      <div style={{ fontSize: '0.9rem' }}>
        <div>Active Tasks: {activeCarrierTasksCount}</div>
        <div>Queued Jobs: {queuedJobsCount}</div>
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
            checked={showFootfallHeatmap}
            onChange={toggleFootfallHeatmap}
          />
          Show footfall heatmap
        </label>
      </div>
    </div>
  );
}
