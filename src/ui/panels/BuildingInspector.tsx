import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from '../../game/core/economy.data';
import { canAffordUpgrade, getUpgradeCost } from '../../game/economy/production.logic';
import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';
import { WorkerType, ResourceType } from '../../game/core/economy.types';
import { RECIPES } from '../../game/economy/recipes.data';
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
  const setDeliveryPriority = useGameStore((state) => state.setDeliveryPriority);
  const togglePausedInput = useGameStore((state) => state.togglePausedInput);
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

      <DeliveryControlsSection
        building={building}
        onSetPriority={(p) => setDeliveryPriority(building.id, p)}
        onTogglePause={(r) => togglePausedInput(building.id, r)}
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

  return (
    <section className="inventory-block">
      <h3>Hire Workers</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {slotEntries.map(([workerType, maxCount]) => {
          const current = assignedCounts[workerType] ?? 0;
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
              <button
                className="hud-button worker-hire-row__btn"
                onClick={() => onHire(workerType)}
                disabled={!player || vacant <= 0}
                title={`Hire ${workerDef?.name ?? workerType}`}
              >
                Hire
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type DeliveryControlsSectionProps = {
  building: import('../../game/core/game.types').BuildingInstance;
  onSetPriority: (priority: number) => void;
  onTogglePause: (resource: ResourceType) => void;
};

function DeliveryControlsSection({ building, onSetPriority, onTogglePause }: DeliveryControlsSectionProps) {
  const def = BUILDING_DEFINITIONS[building.type];
  const priority = building.deliveryPriority ?? 3;

  // Vaults don't use delivery priority in transport logic; hide UI
  if (def.type === "vaultOfDigestiveStone") {
    return null;
  }

  const inputResources = new Set<ResourceType>();
  for (const recipeId of def.recipeIds ?? []) {
    const recipe = RECIPES[recipeId];
    if (!recipe) continue;
    for (const r of Object.keys(recipe.inputs) as ResourceType[]) {
      inputResources.add(r);
    }
  }

  return (
    <section className="inventory-block">
      <h3>Delivery Controls</h3>
      <div className="delivery-priority-row">
        <span>Priority</span>
        <div className="delivery-priority-btns">
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              className={`hud-button delivery-priority-btn${priority === p ? ' delivery-priority-btn--active' : ''}`}
              onClick={() => onSetPriority(p)}
              title={`Set delivery priority ${p}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {inputResources.size > 0 && (
        <div className="delivery-pause-list">
          <span className="delivery-pause-label">Pause delivery</span>
          {Array.from(inputResources).map((r) => {
            const paused = building.pausedInputs?.[r] ?? false;
            const imgSrc = imageMap[`resources/${r}.png`];
            return (
              <button
                key={r}
                className={`hud-button resource-pill delivery-pause-btn${paused ? ' delivery-pause-btn--paused' : ''}`}
                onClick={() => onTogglePause(r)}
                title={`${paused ? 'Resume' : 'Pause'} delivery of ${r}`}
              >
                {imgSrc ? (
                  <img src={imgSrc} alt="" aria-hidden="true" />
                ) : (
                  <span>{(r.charAt(0) || '?').toUpperCase()}</span>
                )}
                {paused ? '✕' : '✓'}
              </button>
            );
          })}
        </div>
      )}
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

