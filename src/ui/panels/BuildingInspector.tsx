import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from '../../game/core/economy.data';
import { canAffordUpgrade, getUpgradeCost } from '../../game/economy/production.logic';
import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';
import { WorkerType } from '../../game/core/economy.types';
import imageMap from '../../pixi/utils/vite-asset-loader';

type BuildingInspectorProps = {
  buildingId: string;
};

export default function BuildingInspector({ buildingId }: BuildingInspectorProps): JSX.Element | null {
  const building = useGameStore((state) => state.gameState.buildings[buildingId]);
  const player = useGameStore((state) => building ? state.gameState.players[building.ownerId] : undefined);
  const workers = useGameStore((state) => state.gameState.workers);
  const upgradeBuildingAt = useGameStore((state) => state.upgradeBuildingAt);
  const connectBuildingAt = useGameStore((state) => state.connectBuildingAt);
  const toggleBuildingActive = useGameStore((state) => state.toggleBuildingActive);
  const spawnAndAssignWorker = useGameStore((state) => state.spawnAndAssignWorker);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  if (!building || !player) return null;

  const def = BUILDING_DEFINITIONS[building.type] || { name: 'Unknown', description: '', maxLevel: 1 };
  const upgradeCost = getUpgradeCost(building, building.level + 1);
  const canUpgrade = canAffordUpgrade(player, building);

  return (
    <aside className="macabre-panel inspector-panel" aria-label="Building inspector">
      <div className="inspector-panel__header">
        <img
          src={imageMap[`buildings/stage4/${building.type}.png`]}
          alt=""
          aria-hidden="true"
          className="inspector-portrait"
        />
        <div>
          <span className="panel-kicker">Building</span>
          <h2>{def.name}</h2>
        </div>
        <button className="hud-button" onClick={clearSelection}>Close</button>
      </div>

      <p className="inspector-panel__description">{def.description}</p>

      <dl className="inspector-stats">
        <div><dt>Level</dt><dd>{building.level}/{def.maxLevel}</dd></div>
        <div><dt>Integrity</dt><dd>{Math.round(building.integrity)}%</dd></div>
        <div><dt>Status</dt><dd>{building.isActive ? 'active' : 'paused'}</dd></div>
        <div><dt>Road</dt><dd>{building.connectedToRoad ? 'connected' : 'missing'}</dd></div>
        <div><dt>Workers</dt><dd>{building.assignedWorkers.length}</dd></div>
        <div><dt>Corruption</dt><dd>{Math.round(building.corruption ?? 0)}%</dd></div>
      </dl>

      <InventoryBlock title="Input" inventory={building.inputBuffer} />
      <InventoryBlock title="Output" inventory={building.outputBuffer} />

      <div className="inspector-actions">
        <button className="hud-button" onClick={() => toggleBuildingActive(building.id)}>
          {building.isActive ? 'Pause' : 'Resume'}
        </button>
        {!building.connectedToRoad ? (
          <button className="hud-button" onClick={() => connectBuildingAt(building.id)}>Connect road</button>
        ) : null}
        <button className="hud-button" disabled={!canUpgrade} onClick={() => upgradeBuildingAt(player.id, building.id)}>
          Upgrade
        </button>
      </div>

      {upgradeCost ? (
        <div className="cost-row">
          {Object.entries(upgradeCost.resources).map(([resource, amount]) => {
            const imgSrc = imageMap[`resources/${resource}.png`];
            return (
              <span key={resource} className="resource-pill" title={resource}>
                {imgSrc ? (
                  <img src={imgSrc} alt="" aria-hidden="true" />
                ) : (
                  <span>{(resource.charAt(0) || '?').toUpperCase()}</span>
                )}
                {amount}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="inspector-note">Maximum level reached.</p>
      )}

      <WorkerSlotsSection
        building={building}
        player={player}
        workers={workers}
        onHire={(workerType) => spawnAndAssignWorker(building.ownerId, workerType, building.id)}
      />
    </aside>
  );
}

type WorkerSlotsSectionProps = {
  building: import('../../game/core/game.types').BuildingInstance;
  player: import('../../game/core/game.types').PlayerState | undefined;
  workers: Record<string, import('../../game/core/game.types').WorkerInstance>;
  onHire: (workerType: WorkerType) => void;
};

function WorkerSlotsSection({ building, player, workers, onHire }: WorkerSlotsSectionProps) {
  const def = BUILDING_DEFINITIONS[building.type];
  const slots = def.workerSlots;
  const slotEntries = Object.entries(slots).filter(([, count]) => (count ?? 0) > 0) as [WorkerType, number][];
  if (slotEntries.length === 0) return null;

  const assignedCounts: Partial<Record<WorkerType, number>> = {};
  for (const wid of building.assignedWorkers) {
    const w = workers[wid];
    if (w) assignedCounts[w.type] = (assignedCounts[w.type] ?? 0) + 1;
  }

  const hasVacancy = slotEntries.some(([type, max]) => (assignedCounts[type] ?? 0) < max);
  if (!hasVacancy) return null;

  return (
    <section className="inventory-block">
      <h3>Hire Workers</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {slotEntries.map(([workerType, maxCount]) => {
          const current = assignedCounts[workerType] ?? 0;
          if (current >= maxCount) return null;
          const workerDef = WORKER_DEFINITIONS[workerType];
          const portraitSrc = imageMap[`workers/${workerType}.png`];
          const vacant = maxCount - current;
          return (
            <div key={workerType} className="worker-hire-row">
              {portraitSrc ? (
                <img src={portraitSrc} alt="" aria-hidden="true" className="worker-hire-row__portrait" />
              ) : (
                <div className="worker-hire-row__portrait" />
              )}
              <span className="worker-hire-row__name">{workerDef?.name ?? workerType}</span>
              <span className="worker-hire-row__slots">{current}/{maxCount}</span>
              {Array.from({ length: vacant }).map((_, i) => (
                <button
                  key={i}
                  className="hud-button worker-hire-row__btn"
                  onClick={() => onHire(workerType)}
                  disabled={!player}
                  title={`Hire ${workerDef?.name ?? workerType}`}
                >
                  Hire
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

type InventoryBlockProps = {
  title: string;
  inventory: Record<string, number | undefined>;
};

function InventoryBlock({ title, inventory }: InventoryBlockProps) {
  const entries = Object.entries(inventory).filter(([, amount]) => (amount ?? 0) > 0);
  return (
    <section className="inventory-block">
      <h3>{title}</h3>
      {entries.length ? (
        <div className="cost-row">
          {entries.map(([resource, amount]) => {
            const imgSrc = imageMap[`resources/${resource}.png`];
            return (
              <span key={resource} className="resource-pill" title={resource}>
                {imgSrc ? (
                  <img src={imgSrc} alt="" aria-hidden="true" />
                ) : (
                  <span>{(resource.charAt(0) || '?').toUpperCase()}</span>
                )}
                {amount}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="inspector-note">empty</p>
      )}
    </section>
  );
}

