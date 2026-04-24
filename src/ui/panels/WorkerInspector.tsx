import React from 'react';
import { WORKER_DEFINITIONS } from '../../game/core/economy.data';
import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';
import imageMap from '../../pixi/utils/vite-asset-loader';

type WorkerInspectorProps = {
  workerId: string;
};

export default function WorkerInspector({ workerId }: WorkerInspectorProps): JSX.Element | null {
  const worker = useGameStore((state) => state.gameState.workers[workerId]);
  const homeBuilding = useGameStore((state) => {
    const w = state.gameState.workers[workerId];
    return w?.homeBuildingId ? state.gameState.buildings[w.homeBuildingId] : undefined;
  });
  const activeTask = useGameStore((state) => state.gameState.transport.activeCarrierTasks[workerId]);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  if (!worker) return null;

  const def = WORKER_DEFINITIONS[worker.type] || { name: 'Unknown Worker', description: 'No definition found.' };

  return (
    <aside className="macabre-panel inspector-panel" aria-label="Worker inspector">
      <div className="inspector-panel__header">
        {imageMap[`workers/${worker.type}.png`] ? (
          <img
            src={imageMap[`workers/${worker.type}.png`]}
            alt=""
            aria-hidden="true"
            className="inspector-portrait"
          />
        ) : (
          <div className="inspector-portrait" style={{ backgroundColor: '#222' }} />
        )}
        <div>
          <span className="panel-kicker">Worker</span>
          <h2>{def.name}</h2>
        </div>
        <button className="hud-button" onClick={clearSelection}>Close</button>
      </div>

      <p className="inspector-panel__description">{def.description}</p>

      <dl className="inspector-stats">
        <div><dt>Status</dt><dd>{worker.isIdle ? 'idle' : 'working'}</dd></div>
        <div><dt>Morale</dt><dd>{Math.round(worker.morale)}%</dd></div>
        <div><dt>Infection</dt><dd>{Math.round(worker.infection)}%</dd></div>
        <div><dt>Scars</dt><dd>{worker.scars}</dd></div>
        <div><dt>Position</dt><dd>{worker.position.x}, {worker.position.y}</dd></div>
        <div><dt>Home</dt><dd>{homeBuilding?.type ?? 'none'}</dd></div>
      </dl>

      {activeTask ? (
        <section className="inventory-block">
          <h3>Transport</h3>
          <p className="inspector-note">{activeTask.resourceType} {activeTask.phase}</p>
        </section>
      ) : null}
    </aside>
  );
}

