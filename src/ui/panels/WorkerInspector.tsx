import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';
import { useShallow } from 'zustand/react/shallow';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { getWorkerInspectorModel } from '../../store/workerDomain';

type WorkerInspectorProps = {
  workerId: string;
};

export default function WorkerInspector({ workerId }: WorkerInspectorProps): JSX.Element | null {
  const { worker, homeBuilding, activeTask, pickupBuilding, dropoffBuilding } = useGameStore(
    useShallow((state) => {
      const selectedWorker = state.gameState.workers[workerId];
      const task = state.gameState.transport.activeCarrierTasks[workerId];
      return {
        worker: selectedWorker,
        homeBuilding: selectedWorker?.homeBuildingId
          ? state.gameState.buildings[selectedWorker.homeBuildingId]
          : undefined,
        activeTask: task,
        pickupBuilding: task ? state.gameState.buildings[task.pickupBuildingId] : undefined,
        dropoffBuilding: task ? state.gameState.buildings[task.dropoffBuildingId] : undefined,
      };
    }),
  );
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  if (!worker) return null;

  const taskBuildings = activeTask
    ? {
      [activeTask.pickupBuildingId]: pickupBuilding,
      [activeTask.dropoffBuildingId]: dropoffBuilding,
    }
    : {};

  const workerModel = getWorkerInspectorModel(worker, activeTask, taskBuildings);
  const def = workerModel?.definition || { name: 'Unknown Worker', description: 'No definition found.' };
  const transport = workerModel?.transport;
  const portraitSrc = imageMap[`workers/${worker.type}.png`] ?? imageMap[`workers/${worker.type}.svg`];

  return (
    <aside className="macabre-panel inspector-panel" aria-label="Worker inspector">
      <div className="inspector-panel__header">
        {portraitSrc ? (
          <img
            src={portraitSrc}
            alt=""
            aria-hidden="true"
            className="inspector-portrait"
          />
        ) : (
          <div className="inspector-portrait inspector-portrait--placeholder" />
        )}
        <div>
          <span className="panel-kicker">Worker</span>
          <h2>{def.name}</h2>
        </div>
        <button className="hud-button" onClick={clearSelection} aria-label="Close worker inspector">Close</button>
      </div>

      <p className="inspector-panel__description">{def.description}</p>

      <dl className="inspector-stats">
        <div><dt>Status</dt><dd>{workerModel?.status ?? 'missing'}</dd></div>
        <div><dt>Morale</dt><dd>{Math.round(worker.morale)}%</dd></div>
        <div><dt>Infection</dt><dd>{Math.round(worker.infection)}%</dd></div>
        <div><dt>Scars</dt><dd>{worker.scars}</dd></div>
        <div><dt>Position</dt><dd>{worker.position.x}, {worker.position.y}</dd></div>
        <div><dt>Home</dt><dd>{homeBuilding?.type ?? 'none'}</dd></div>
        <div><dt>Carrying</dt><dd>{transport?.carrying ?? 'Nothing'}</dd></div>
      </dl>

      <section className="inventory-block worker-transport">
        <h3>Transport</h3>
        <dl className="inspector-stats worker-transport__stats">
          <div><dt>Delivery State</dt><dd>{transport?.deliveryState ?? 'Idle'}</dd></div>
          <div><dt>Route</dt><dd>{transport?.route ?? 'No active route'}</dd></div>
          <div><dt>Progress</dt><dd>{transport?.progress ?? 'No active route'}</dd></div>
        </dl>
        <p className="inspector-note">{transport?.idleReason ?? transport?.detail ?? 'No transport details available.'}</p>
        {transport?.idleReason ? (
          <p className="inspector-note worker-transport__hint">{transport.detail}</p>
        ) : null}
      </section>
    </aside>
  );
}
