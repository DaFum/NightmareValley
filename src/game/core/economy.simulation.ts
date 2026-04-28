import { OwnerId, BuildingId, WorkerId, TileId } from "./entity.ids";
import {
  PlayerState,
  BuildingInstance,
  WorkerInstance,
  TerritoryState,
  Position,
  MapTile,
} from "./game.types";
import { BuildingType, WorkerType, ResourceType, ResourceInventory } from "./economy.types";
import { TransportState } from "../economy/transport.logic";
import { BUILDING_DEFINITIONS } from "./economy.data";
import { SimulationConfig, DEFAULT_SIMULATION_CONFIG } from "../economy/balancing.constants";
import { removeResource, hasEnoughResources, getResourceAmount } from "../economy/stockpile.logic";
import { getUpgradeCost } from "../economy/production.logic";
import { isConstructed } from "../entities/buildings/building.types";

// Exported from original but using relative imports
import { processConstruction, autoSpawnConstructionWorkers } from "../economy/construction.logic";
import { updateWorkersAI } from "../entities/workers/worker.logic";
import { processExtraction } from "../economy/extraction.logic";
import { processProduction } from "../economy/production.logic";
import {
  generateTransportJobs,
  assignCarrierTasks,
  advanceCarrierMovement,
  decayFootfall,
  updateTransportMetrics
} from "../economy/transport.logic";

export interface EconomySimulationState {
  tick: number;
  ageOfTeeth: number;
  players: Record<OwnerId, PlayerState>;
  buildings: Record<BuildingId, BuildingInstance>;
  workers: Record<WorkerId, WorkerInstance>;
  territory: TerritoryState;
  transport: TransportState;
  worldPulse: number;
}

export function createBuildingInstance(
  id: BuildingId,
  type: BuildingType,
  ownerId: OwnerId,
  position: Position
): BuildingInstance {
  return {
    id,
    type,
    ownerId,
    level: 0,
    constructionProgress: 0,
    integrity: 100,
    position,
    connectedToRoad: false,
    inputBuffer: {},
    outputBuffer: {},
    internalStorage: {},
    assignedWorkers: [],
    progressSec: 0,
    isActive: true,
    liturgy: "Consume. Convert. Continue.",
    corruption: 0,
  };
}

export function isTileBuildableForPlayer(
  tile: MapTile,
  playerId: OwnerId,
  buildingType: BuildingType
): boolean {
  const def = BUILDING_DEFINITIONS[buildingType];
  const isOwned = tile.ownerId === playerId;
  const terrainAllowed = def.allowedTerrain.includes(tile.terrain);
  const isFree = !tile.buildingId;

  return isOwned && terrainAllowed && isFree;
}

// =========================
// INTERNAL HELPERS
// =========================

export function cloneState(state: EconomySimulationState): EconomySimulationState {
  if (typeof structuredClone === "function") {
    return structuredClone(state);
  }
  return {
    ...state,
    players: deepClone(state.players),
    buildings: deepClone(state.buildings),
    workers: deepClone(state.workers),
    territory: deepClone(state.territory),
    transport: deepClone(state.transport),
  };
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function requiresRoad(buildingType: BuildingType): boolean {
  return BUILDING_DEFINITIONS[buildingType].requiresRoadConnection;
}

export function hasAssignedWorkersForBuilding(
  state: EconomySimulationState,
  building: BuildingInstance
): boolean {
  const def = BUILDING_DEFINITIONS[building.type];
  const slots = def.workerSlots;

  // Early exit if no workers are required
  const hasRequirements = Object.values(slots).some((amount) => (amount ?? 0) > 0);
  if (!hasRequirements) return true;

  // Count assigned workers by type in one pass
  const counts: Partial<Record<WorkerType, number>> = {};
  for (const id of building.assignedWorkers) {
    const worker = state.workers[id];
    if (worker) {
      counts[worker.type] = (counts[worker.type] ?? 0) + 1;
    }
  }

  // Check against requirements
  for (const type in slots) {
    const workerType = type as WorkerType;
    const requiredCount = slots[workerType] ?? 0;
    if (requiredCount > 0) {
      const assigned = counts[workerType] ?? 0;
      if (assigned < requiredCount) {
        return false;
      }
    }
  }

  return true;
}

export function getNonZeroResources(inventory: ResourceInventory): ResourceType[] {
  return Object.entries(inventory)
    .filter(([, amount]) => (amount ?? 0) > 0)
    .map(([resource]) => resource as ResourceType);
}

export function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function mergeInventoryInto(
  target: Partial<Record<ResourceType, number>>,
  source: ResourceInventory
): void {
  for (const [resource, amount] of Object.entries(source)) {
    const key = resource as ResourceType;
    target[key] = (target[key] ?? 0) + (amount ?? 0);
  }
}

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// =========================
// VAULT ↔ STOCK SYNC
// =========================

// Mutates state.players[*].stock in-place and returns the same reference (fluent).
// Callers MUST pass an already-cloned state — this function does not clone internally.
// All current call sites satisfy this: simulateTick and placeBuilding/upgradeBuilding
// each call cloneState() before calling this function.
export function syncStockFromVaults(state: EconomySimulationState): EconomySimulationState {
  for (const player of Object.values(state.players)) {
    const merged: Partial<Record<ResourceType, number>> = {};
    let hasVault = false;
    for (const buildingId of player.buildings) {
      const building = state.buildings[buildingId];
      if (building && building.type === "vaultOfDigestiveStone") {
        hasVault = true;
        mergeInventoryInto(merged, building.outputBuffer);
      }
    }
    // Only update stock if vaults exist; preserve stock if player has no vaults
    if (hasVault) {
      player.stock = merged as ResourceInventory;
    }
  }
  return state;
}

// =========================
// BUILD / UPGRADE / SPAWN HELPERS
// =========================

export function getOwnerVaults(state: EconomySimulationState, ownerId: string): BuildingInstance[] {
  const player = state.players[ownerId];
  if (!player) return [];
  const vaults: BuildingInstance[] = [];
  for (const playerBuildingId of player.buildings) {
    const b = state.buildings[playerBuildingId];
    if (b && b.type === "vaultOfDigestiveStone") {
      vaults.push(b);
    }
  }
  return vaults;
}

// Checks affordability across vaults (or player.stock if none), then deducts in-place.
// Caller must pass vault/player references from already-cloned state.
function deductAcrossVaults(
  vaults: BuildingInstance[],
  player: PlayerState,
  costs: Partial<Record<ResourceType, number>>
): void {
  let affordabilitySource: ResourceInventory = player.stock;
  if (vaults.length > 0) {
    affordabilitySource = {};
    for (const v of vaults) {
      mergeInventoryInto(affordabilitySource, v.outputBuffer);
    }
  }
  if (!hasEnoughResources(affordabilitySource, costs)) {
    throw new Error("Insufficient resources");
  }
  for (const [resource, amount] of Object.entries(costs)) {
    let remaining = amount ?? 0;
    if (vaults.length > 0) {
      for (const vault of vaults) {
        const available = getResourceAmount(vault.outputBuffer, resource as ResourceType);
        const toRemove = Math.min(available, remaining);
        if (toRemove > 0) {
          vault.outputBuffer = removeResource(vault.outputBuffer, resource as ResourceType, toRemove);
          remaining -= toRemove;
        }
        if (remaining <= 0) break;
      }
    } else {
      player.stock = removeResource(player.stock, resource as ResourceType, remaining);
    }
  }
}

export function spawnWorker(
  state: EconomySimulationState,
  ownerId: string,
  workerType: WorkerType,
  position: Position,
  homeBuildingId?: BuildingId
): EconomySimulationState {
  const next = cloneState(state);

  const player = next.players[ownerId];
  if (!player) {
    throw new Error(`Unknown player: ${ownerId}`);
  }

  if (player.workers.length >= (player.populationLimit ?? Infinity)) {
    throw new Error(`Population limit reached for player ${ownerId}`);
  }

  if (homeBuildingId) {
    const home = next.buildings[homeBuildingId];
    if (!home) {
      throw new Error(`Unknown home building: ${homeBuildingId}`);
    }
    if (home.ownerId !== ownerId) {
      throw new Error(`Building ${homeBuildingId} belongs to another player`);
    }
  }

  const workerId = createId("worker");
  next.workers[workerId] = {
    id: workerId,
    type: workerType,
    ownerId,
    homeBuildingId: undefined, // Let assignWorkerToBuilding handle this safely
    currentBuildingId: undefined,
    position: { ...position },
    isIdle: true,
    morale: 100,
    infection: 0,
    scars: 0,
  };

  next.players[ownerId].workers.push(workerId);

  if (homeBuildingId) {
    try {
      // Delegate assignment and validations to the proper flow
      return assignWorkerToBuilding(next, workerId, homeBuildingId);
    } catch (err) {
      // Rollback on failure
      delete next.workers[workerId];
      next.players[ownerId].workers = next.players[ownerId].workers.filter((id) => id !== workerId);
      throw err;
    }
  }

  return next;
}

export function placeBuilding(
  state: EconomySimulationState,
  ownerId: string,
  buildingType: BuildingType,
  tileId: TileId
): EconomySimulationState {
  const next = cloneState(state);
  const player = next.players[ownerId];
  const tile = next.territory.tiles[tileId];
  const def = BUILDING_DEFINITIONS[buildingType];

  if (!player) {
    throw new Error(`Unknown player: ${ownerId}`);
  }

  if (!tile) {
    throw new Error(`Unknown tile: ${tileId}`);
  }

  if (!isTileBuildableForPlayer(tile, ownerId, buildingType)) {
    throw new Error(`Tile ${tileId} rejects ${buildingType}`);
  }

  const vaults = getOwnerVaults(next, ownerId);
  try {
    deductAcrossVaults(vaults, player, def.buildCost.resources);
  } catch (err) {
    if (err instanceof Error && err.message === "Insufficient resources") {
      throw new Error(`Player ${ownerId} cannot afford ${buildingType}`);
    }
    throw err;
  }

  const buildingId = createId("building");
  next.buildings[buildingId] = createBuildingInstance(
    buildingId,
    buildingType,
    ownerId,
    tile.position
  );

  tile.buildingId = buildingId;
  player.buildings.push(buildingId);

  return syncStockFromVaults(next);
}

export function connectBuildingToRoad(
  state: EconomySimulationState,
  buildingId: BuildingId,
  ownerId?: string
): EconomySimulationState {
  const next = cloneState(state);
  const building = next.buildings[buildingId];

  if (!building) {
    throw new Error(`Unknown building: ${buildingId}`);
  }

  if (ownerId !== undefined && building.ownerId !== ownerId) {
    throw new Error(`Building ${buildingId} belongs to another player`);
  }

  building.connectedToRoad = true;
  return next;
}

export function upgradeBuilding(
  state: EconomySimulationState,
  ownerId: string,
  buildingId: BuildingId
): EconomySimulationState {
  const next = cloneState(state);

  const player = next.players[ownerId];
  const building = next.buildings[buildingId];

  if (!player || !building) {
    throw new Error(`Unknown owner or building`);
  }

  if (building.ownerId !== ownerId) {
    throw new Error(`Building ${buildingId} belongs to another regime`);
  }

  if (!isConstructed(building)) {
    throw new Error(`Building is still under construction`);
  }

  const cost = getUpgradeCost(building, building.level + 1);
  if (!cost) {
    throw new Error(`Building ${buildingId} cannot ascend further`);
  }

  const vaults = getOwnerVaults(next, ownerId);
  try {
    deductAcrossVaults(vaults, player, cost.resources);
  } catch (err) {
    if (err instanceof Error && err.message === "Insufficient resources") {
      throw new Error(`Upgrade denied by inventory`);
    }
    throw err;
  }

  building.level += 1;
  building.integrity = Math.min(100, building.integrity + 10);

  return syncStockFromVaults(next);
}

export function assignWorkerToBuilding(
  state: EconomySimulationState,
  workerId: WorkerId,
  buildingId: BuildingId
): EconomySimulationState {
  const next = cloneState(state);

  const worker = next.workers[workerId];
  const building = next.buildings[buildingId];

  if (!worker || !building) {
    throw new Error("Unknown worker or building");
  }

  if (worker.ownerId !== building.ownerId) {
    throw new Error("Cannot assign worker to building of different owner");
  }

  if (building.assignedWorkers.includes(workerId)) {
    return next; // Idempotent: already assigned
  }

  const def = BUILDING_DEFINITIONS[building.type];
  const allowedSlots = def.workerSlots[worker.type] ?? 0;

  let currentAssignedSameType = 0;
  for (const id of building.assignedWorkers) {
    const w = next.workers[id];
    if (w && w.type === worker.type) {
      currentAssignedSameType++;
    }
  }

  if (allowedSlots <= currentAssignedSameType) {
    throw new Error(`${building.type} has no free slot for ${worker.type}`);
  }

  if (worker.currentBuildingId && worker.currentBuildingId !== buildingId) {
    const prevBuilding = next.buildings[worker.currentBuildingId];
    if (prevBuilding) {
      prevBuilding.assignedWorkers = prevBuilding.assignedWorkers.filter((id) => id !== workerId);
    }
  }

  if (!building.assignedWorkers.includes(workerId)) {
    building.assignedWorkers.push(workerId);
  }

  worker.currentBuildingId = buildingId;
  worker.homeBuildingId = worker.homeBuildingId ?? buildingId;

  return next;
}

// =========================
// WORKER PASSIVE STATE
// =========================

export function updateWorkersPassiveState(
  state: EconomySimulationState,
  deltaSec: number,
  config: SimulationConfig
): EconomySimulationState {
  for (const worker of Object.values(state.workers)) {
    if (worker.isIdle) {
      worker.morale = clamp(
        worker.morale + config.workerMoraleRecoveryIdlePerTick * deltaSec,
        0,
        100
      );
    } else {
      worker.morale = clamp(
        worker.morale - config.workerMoraleDecayPerTick * deltaSec,
        0,
        100
      );
    }

    let homeBuilding: BuildingInstance | undefined = undefined;
    if (worker.currentBuildingId) homeBuilding = state.buildings[worker.currentBuildingId];
    else if (worker.homeBuildingId) homeBuilding = state.buildings[worker.homeBuildingId];

    const localCorruption = homeBuilding?.corruption ?? 0;

    worker.infection = clamp(
      worker.infection + localCorruption * config.workerInfectionGainFromCorruption * deltaSec,
      0,
      100
    );
  }

  return state;
}

export function updateWorldPulse(state: EconomySimulationState): EconomySimulationState {
  const totalCorruption = Object.values(state.buildings).reduce(
    (sum, b) => sum + (b.corruption ?? 0),
    0
  );

  const totalInfection = Object.values(state.workers).reduce(
    (sum, w) => sum + (w.infection ?? 0),
    0
  );

  state.worldPulse = totalCorruption * 0.1 + totalInfection * 0.05 + state.transport.networkStress;

 return state;
}

// =========================
// PUBLIC API
// =========================

export function simulateTick(
  state: EconomySimulationState,
  deltaSec: number,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): EconomySimulationState {
  if (!Number.isFinite(deltaSec) || deltaSec <= 0) {
    throw new Error(`Invalid deltaSec: ${deltaSec}`);
  }

  let next = cloneState(state);

  next.tick += 1;
  next.ageOfTeeth += deltaSec;

  next = processConstruction(next, deltaSec);
  next = autoSpawnConstructionWorkers(next);
  next = updateWorkersAI(next, deltaSec, config);
  next = updateWorkersPassiveState(next, deltaSec, config);
  next = processExtraction(next, deltaSec, config);
  next = processProduction(next, deltaSec, config);
  next = generateTransportJobs(next, config);
  next = assignCarrierTasks(next, config);
  next = advanceCarrierMovement(next, deltaSec, config);
  next = decayFootfall(next, config);
  next = updateTransportMetrics(next, config);
  next = updateWorldPulse(next);
  next = syncStockFromVaults(next);

  return next;
}
