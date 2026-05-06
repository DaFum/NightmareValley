import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from '../../game/core/economy.data';
import { canAffordUpgrade, canAffordWorker, getUpgradeCost, getWorkerHireCost } from '../../game/economy/production.logic';
import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';
import { useShallow } from 'zustand/react/shallow';
import { WorkerType, ResourceType, ResourceInventory } from '../../game/core/economy.types';
import { RECIPES } from '../../game/economy/recipes.data';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { getProductionStatus } from '../../game/entities/buildings/building.status';
import { DEFAULT_SIMULATION_CONFIG } from '../../game/economy/balancing.constants';

type BuildingInspectorProps = {
  buildingId: string;
};

export default function BuildingInspector({ buildingId }: BuildingInspectorProps): JSX.Element | null {
  const building = useGameStore((state) => state.gameState.buildings[buildingId]);
  const player = useGameStore((state) => building ? state.gameState.players[building.ownerId] : undefined);
  const vaultInventory = useGameStore(
    useShallow((state): ResourceInventory | null => {
      if (!building) return null;
      const p = state.gameState.players[building.ownerId];
      if (!p) return null;
      const merged: Record<string, number> = {};
      let hasVault = false;
      for (const bid of p.buildings) {
        const b = state.gameState.buildings[bid];
        if (b?.type === 'vaultOfDigestiveStone') {
          hasVault = true;
          for (const [res, amt] of Object.entries(b.outputBuffer)) {
            merged[res] = (merged[res] ?? 0) + (amt ?? 0);
          }
        }
      }
      return hasVault ? (merged as ResourceInventory) : null;
    })
  );
  const workers = useGameStore(
    useShallow((state) => {
      if (!building) return {};
      const result: Record<string, typeof state.gameState.workers[string]> = {};
      for (const workerId of building.assignedWorkers) {
        const worker = state.gameState.workers[workerId];
        if (worker) result[workerId] = worker;
      }
      return result;
    })
  );
  const upgradeBuildingAt = useGameStore((state) => state.upgradeBuildingAt);
  const connectBuildingAt = useGameStore((state) => state.connectBuildingAt);
  const toggleBuildingActive = useGameStore((state) => state.toggleBuildingActive);
  const spawnAndAssignWorker = useGameStore((state) => state.spawnAndAssignWorker);
  const setBuildingRecipeAt = useGameStore((state) => state.setBuildingRecipeAt);
  const toggleBuildingAutoHireAt = useGameStore((state) => state.toggleBuildingAutoHireAt);
  const setDeliveryPriority = useGameStore((state) => state.setDeliveryPriority);
  const togglePausedInput = useGameStore((state) => state.togglePausedInput);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  if (!building || !player) return null;

  const def = BUILDING_DEFINITIONS[building.type] || { name: 'Unknown', description: '', maxLevel: 1 };
  const productionStatus = getProductionStatus(
    useGameStore.getState().gameState,
    building,
    DEFAULT_SIMULATION_CONFIG
  );
  const upgradeCost = getUpgradeCost(building, building.level + 1);
  const inventory = vaultInventory ?? player.stock;
  const canUpgrade = canAffordUpgrade(inventory, building);

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
        <div><dt>Status</dt><dd title={productionStatus.detail}>{statusLabel(productionStatus.kind)}</dd></div>
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
        inventory={inventory}
        onHire={(workerType) => spawnAndAssignWorker(building.ownerId, workerType, building.id)}
        onToggleAutoHire={(workerType) => toggleBuildingAutoHireAt(building.ownerId, building.id, workerType)}
        onHireMany={(workerType, count) => {
          for (let i = 0; i < count; i++) {
            spawnAndAssignWorker(building.ownerId, workerType, building.id);
          }
        }}
      />

      <RecipeSelectionSection
        building={building}
        onSelectRecipe={(recipeId) => setBuildingRecipeAt(building.ownerId, building.id, recipeId)}
      />

      <DeliveryControlsSection
        building={building}
        onSetPriority={(p) => setDeliveryPriority(building.id, p)}
        onTogglePause={(r) => togglePausedInput(building.id, r)}
      />
    </aside>
  );
}

type RecipeSelectionSectionProps = {
  building: import('../../game/core/game.types').BuildingInstance;
  onSelectRecipe: (recipeId: string) => void;
};

function RecipeSelectionSection({ building, onSelectRecipe }: RecipeSelectionSectionProps) {
  const def = BUILDING_DEFINITIONS[building.type];
  const recipeIds = def.recipeIds ?? [];
  if (recipeIds.length <= 1) return null;

  const activeRecipeId = building.currentRecipeId && recipeIds.includes(building.currentRecipeId)
    ? building.currentRecipeId
    : recipeIds[0];

  return (
    <section className="inventory-block">
      <h3>Recipe</h3>
      <div className="recipe-selector">
        {recipeIds.map((recipeId) => {
          const recipe = RECIPES[recipeId];
          if (!recipe) return null;
          const active = recipeId === activeRecipeId;
          return (
            <button
              key={recipeId}
              className={`recipe-selector__option ${active ? 'active' : ''}`}
              onClick={() => onSelectRecipe(recipeId)}
              aria-pressed={active}
              title={recipe.description}
            >
              <strong>{recipe.name}</strong>
              <span>{formatRecipeFlow(recipe)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function formatRecipeFlow(recipe: (typeof RECIPES)[string]) {
  const inputs = Object.entries(recipe.inputs).map(([resource, amount]) => `${amount} ${resource}`).join(' + ');
  const outputs = Object.entries(recipe.outputs).map(([resource, amount]) => `${amount} ${resource}`).join(' + ');
  return `${inputs} -> ${outputs}`;
}

function statusLabel(kind: ReturnType<typeof getProductionStatus>['kind']) {
  switch (kind) {
    case 'roadDisconnected':
      return 'road missing';
    case 'missingWorker':
      return 'needs worker';
    case 'missingInput':
      return 'needs input';
    case 'outputFull':
      return 'output full';
    case 'underConstruction':
      return 'building';
    default:
      return kind;
  }
}

type WorkerSlotsSectionProps = {
  building: import('../../game/core/game.types').BuildingInstance;
  player: import('../../game/core/game.types').PlayerState | undefined;
  workers: Record<string, import('../../game/core/game.types').WorkerInstance>;
  inventory: ResourceInventory;
  onHire: (workerType: WorkerType) => void;
  onToggleAutoHire: (workerType: WorkerType) => void;
  onHireMany: (workerType: WorkerType, count: number) => void;
};

function WorkerSlotsSection({ building, player, workers, inventory, onHire, onToggleAutoHire, onHireMany }: WorkerSlotsSectionProps) {
  const def = BUILDING_DEFINITIONS[building.type];
  const slots = def.workerSlots;
  const slotEntries = Object.entries(slots).filter(([, count]) => (count ?? 0) > 0) as [WorkerType, number][];
  if (slotEntries.length === 0) return null;

  const assignedCounts: Partial<Record<WorkerType, number>> = {};
  for (const wid of building.assignedWorkers) {
    const w = workers[wid];
    if (w) assignedCounts[w.type] = (assignedCounts[w.type] ?? 0) + 1;
  }

  const atPopCap = !!player && player.workers.length >= player.populationLimit;
  const freePopulation = player ? Math.max(0, player.populationLimit - player.workers.length) : 0;
  const totalVacancies = slotEntries.reduce((sum, [workerType, maxCount]) => {
    return sum + Math.max(0, maxCount - (assignedCounts[workerType] ?? 0));
  }, 0);
  const canStaffAll = !!player && totalVacancies > 0 && freePopulation > 0;

  const hireAll = () => {
    if (!player) return;
    let remainingPopulation = freePopulation;
    for (const [workerType, maxCount] of slotEntries) {
      if (remainingPopulation <= 0) break;
      const vacant = Math.max(0, maxCount - (assignedCounts[workerType] ?? 0));
      const toHire = Math.min(vacant, remainingPopulation);
      if (toHire > 0) {
        onHireMany(workerType, toHire);
        remainingPopulation -= toHire;
      }
    }
  };

  return (
    <section className="inventory-block">
      <div className="worker-slots-heading">
        <h3>Hire Workers</h3>
        <button
          className="hud-button worker-slots-heading__btn"
          onClick={hireAll}
          disabled={!canStaffAll}
          title={atPopCap ? 'Population limit reached' : 'Fill vacant worker slots'}
        >
          Staff all
        </button>
      </div>
      {atPopCap && (
        <p className="inspector-note">Population limit reached ({player.workers.length}/{player.populationLimit}).</p>
      )}
      <div className="worker-hire-list">
        {slotEntries.map(([workerType, maxCount]) => {
          const current = assignedCounts[workerType] ?? 0;
          const workerDef = WORKER_DEFINITIONS[workerType];
          const portraitSrc = imageMap[`workers/${workerType}.png`] ?? imageMap[`workers/${workerType}.svg`];
          const hireCost = getWorkerHireCost(workerType);
          const vacant = maxCount - current;
          const canAfford = canAffordWorker(inventory, workerType);
          const canHire = !!player && vacant > 0 && !atPopCap && canAfford;
          const autoHire = building.autoHire?.[workerType] ?? false;
          const costLabel = Object.entries(hireCost.resources)
            .map(([resource, amount]) => `${resource}: ${inventory[resource as ResourceType] ?? 0}/${amount}`)
            .join(', ');

          return (
            <div key={workerType} className="worker-hire-row">
              {portraitSrc ? (
                <img src={portraitSrc} alt="" aria-hidden="true" className="worker-hire-row__portrait" />
              ) : (
                <div className="worker-hire-row__portrait" />
              )}
              <span className="worker-hire-row__name">{workerDef?.name ?? workerType}</span>
              <span className="worker-hire-row__slots">{current}/{maxCount}</span>
              <span className="worker-hire-row__costs">
                {Object.entries(hireCost.resources).map(([resource, amount]) => {
                  const imgSrc = imageMap[`resources/${resource}.png`];
                  const currentAmount = inventory[resource as ResourceType] ?? 0;
                  const short = currentAmount < (amount ?? 0);
                  return (
                    <span
                      key={resource}
                      className={`resource-pill ${short ? 'resource-pill--short' : 'resource-pill--ready'}`}
                      title={`${resource}: ${currentAmount}/${amount}`}
                    >
                      {imgSrc ? <img src={imgSrc} alt="" aria-hidden="true" /> : null}
                      {amount}
                    </span>
                  );
                })}
              </span>
              <button
                className="hud-button worker-hire-row__btn"
                onClick={() => onHire(workerType)}
                disabled={!canHire}
                title={atPopCap ? 'Population limit reached' : canAfford ? `Hire ${workerDef?.name ?? workerType}` : `Missing ${costLabel}`}
              >
                Hire
              </button>
              <button
                className={`hud-button worker-hire-row__btn ${autoHire ? 'active' : ''}`}
                onClick={() => onToggleAutoHire(workerType)}
                aria-pressed={autoHire}
                title={`${autoHire ? 'Disable' : 'Enable'} automatic hiring for ${workerDef?.name ?? workerType}`}
              >
                Auto
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

  // Don't show delivery controls for extraction-only buildings (no inputs)
  if (inputResources.size === 0) {
    return null;
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

