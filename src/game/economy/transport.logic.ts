import { BuildingId, WorkerId } from "../core/entity.ids";
import { Position, BuildingInstance, WorkerInstance } from "../core/game.types";
import Logger from "../../lib/logger";
import { ResourceType, WorkerDefinition } from "../core/economy.types";
import { EconomySimulationState, createId, distance, clamp, getNonZeroResources } from "../core/economy.simulation";
import { SimulationConfig, DEFAULT_SIMULATION_CONFIG } from "./balancing.constants";
import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from "../core/economy.data";
import { RECIPES } from "./recipes.data";
import { getResourceAmount, addResource, removeResource } from "./stockpile.logic";
import { findPath, calculatePathDistance, tierTileCost } from "../pathing/path.a-star";
import { MapTile, TerritoryState } from "../core/game.types";

export interface TransportJob {
  id: string;
  fromBuildingId: BuildingId;
  toBuildingId: BuildingId;
  resourceType: ResourceType;
  amount: number;
  priority: number;
  reserved: number;
  delivered: number;
  status: "queued" | "claimed" | "delivered" | "spilled" | "lost";
  description?: string;
}

export interface CarrierTask {
  workerId: WorkerId;
  jobId: string;
  pickupBuildingId: BuildingId;
  dropoffBuildingId: BuildingId;
  resourceType: ResourceType;
  amount: number;
  phase: "toPickup" | "toDropoff";
  path: Position[];
  pathIndex: number;
  stepProgress: number;
}

export interface TransportState {
  jobs: Record<string, TransportJob>;
  activeCarrierTasks: Record<string, CarrierTask>;
  networkStress: number;
  averageLatencySec: number;
  queuedJobCount: number;
}

// =========================
// TRANSPORT JOB GENERATION
// =========================

export function generateTransportJobs(
  state: EconomySimulationState,
  config: SimulationConfig
): EconomySimulationState {
  let created = 0;
  const existingJobSignatures = new Set(
    Object.values(state.transport.jobs)
      .filter((j) => j.status !== "delivered" && j.status !== "lost" && j.status !== "spilled")
      .map(makeTransportSignature)
  );

  const buildings = Object.values(state.buildings);

  for (const source of buildings) {
    if (created >= config.maxJobsPerTick) break;

    for (const resourceType of getNonZeroResources(source.outputBuffer)) {
      let totalReserved = 0;
      for (const j of Object.values(state.transport.jobs)) {
        if (j.fromBuildingId === source.id && j.resourceType === resourceType && j.status !== "delivered" && j.status !== "lost" && j.status !== "spilled") {
          totalReserved += j.reserved;
        }
      }
      const amountAvailable = getResourceAmount(source.outputBuffer, resourceType) - totalReserved;
      if (amountAvailable <= 0) continue;

      const targets = findTargetBuildingsForResource(state, source, resourceType, config);

      for (const target of targets) {
        if (created >= config.maxJobsPerTick) break;

        const neededAmount = getBuildingResourceNeed(target, resourceType, config);
        if (neededAmount <= 0) continue;

        const carrierCapacity = WORKER_DEFINITIONS["burdenThrall"].carryCapacity;
        const amountToMove = Math.min(config.maxJobBatchSize ?? carrierCapacity, carrierCapacity, amountAvailable, neededAmount);
        if (amountToMove <= 0) continue;

        const signature = `${source.id}->${target.id}:${resourceType}`;
        if (existingJobSignatures.has(signature)) continue;

        const jobId = createId("job");
        state.transport.jobs[jobId] = {
          id: jobId,
          fromBuildingId: source.id,
          toBuildingId: target.id,
          resourceType,
          amount: amountToMove,
          priority: getTransportPriority(target, resourceType, config),
          reserved: 0,
          delivered: 0,
          status: "queued",
          description: `Move ${resourceType} from ${source.type} to ${target.type}`,
        };
        state.transport.queuedJobCount = (state.transport.queuedJobCount || 0) + 1;

        existingJobSignatures.add(signature);
        created += 1;
      }
    }
  }

  return state;
}

export function findTargetBuildingsForResource(
  state: EconomySimulationState,
  source: BuildingInstance,
  resourceType: ResourceType,
  config: SimulationConfig
): BuildingInstance[] {
  const buildings = Object.values(state.buildings)
    .filter((b) => b.ownerId === source.ownerId)
    .filter((b) => b.id !== source.id)
    .filter((b) => buildingAcceptsResource(b, resourceType));

  return buildings.sort((a, b) => {
    const aNeed = getBuildingResourceNeed(a, resourceType, config);
    const bNeed = getBuildingResourceNeed(b, resourceType, config);

    if (bNeed !== aNeed) return bNeed - aNeed;

    const aPath = findPath(source.position, a.position, state);
    const bPath = findPath(source.position, b.position, state);
    const aDistance = calculatePathDistance(aPath);
    const bDistance = calculatePathDistance(bPath);

    return aDistance - bDistance;
  });
}

export function buildingAcceptsResource(
  building: BuildingInstance,
  resourceType: ResourceType
): boolean {
  const def = BUILDING_DEFINITIONS[building.type];

  if (def.recipeIds?.length) {
    for (const recipeId of def.recipeIds) {
      const recipe = RECIPES[recipeId];
      if (!recipe) continue;
      if (recipe.inputs[resourceType]) return true;
    }
  }

  if (def.type === "vaultOfDigestiveStone") {
    return true;
  }

  if (def.type === "pitOfWarBirth") {
    return resourceType === "ribBlade" || resourceType === "skinWall";
  }

  return false;
}

export function getBuildingResourceNeed(
  building: BuildingInstance,
  resourceType: ResourceType,
  config: SimulationConfig
): number {
  const def = BUILDING_DEFINITIONS[building.type];

  if (def.type === "vaultOfDigestiveStone") {
    const current =
      getResourceAmount(building.internalStorage, resourceType) +
      getResourceAmount(building.inputBuffer, resourceType);
    return Math.max(0, 999 - current);
  }

  let needed = 0;

  for (const recipeId of def.recipeIds ?? []) {
    const recipe = RECIPES[recipeId];
    if (!recipe) continue;

    const inputAmount = recipe.inputs[resourceType] ?? 0;
    if (inputAmount <= 0) continue;

    const current = getResourceAmount(building.inputBuffer, resourceType);
    const desired = Math.max(inputAmount * 3, 1);
    needed = Math.max(needed, desired - current);
  }

  if (def.type === "pitOfWarBirth") {
    const current = getResourceAmount(building.inputBuffer, resourceType);
    return Math.max(0, 4 - current);
  }

  return Math.min(needed, config.buildingInputBufferLimit);
}

export function getTransportPriority(
  target: BuildingInstance,
  resourceType: ResourceType,
  config: SimulationConfig
): number {
  const def = BUILDING_DEFINITIONS[target.type];

  if (def.inputPriority?.includes(resourceType)) {
    return config.defaultTransportPriority + 10;
  }

  if (target.type === "pitOfWarBirth") {
    return config.defaultTransportPriority + 20;
  }

  if (target.type === "vaultOfDigestiveStone") {
    return config.defaultTransportPriority - 5;
  }

  return config.defaultTransportPriority;
}

export function makeTransportSignature(job: TransportJob): string {
  return `${job.fromBuildingId}->${job.toBuildingId}:${job.resourceType}`;
}

// =========================
// CARRIER ASSIGNMENT
// =========================

export function assignCarrierTasks(
  state: EconomySimulationState,
  config: SimulationConfig
): EconomySimulationState {
  const queuedJobs = Object.values(state.transport.jobs)
    .filter((job) => job.status === "queued")
    .sort((a, b) => b.priority - a.priority);

  const carriers = Object.values(state.workers)
    .filter((w) => w.type === "burdenThrall")
    .filter((w) => w.isIdle);

  for (const carrier of carriers) {
    // Only allow carriers to pick jobs owned by their player
    const ownerJobs = queuedJobs.filter(j => {
      const src = state.buildings[j.fromBuildingId];
      return src && src.ownerId === carrier.ownerId;
    });

    const bestJob = findBestJobForCarrier(state, carrier, ownerJobs, config);
    if (!bestJob) continue;

    const source = state.buildings[bestJob.fromBuildingId];
    if (!source) continue;

    const pathResult = findPath(carrier.position, source.position, state, tierTileCost);
    if (!pathResult.isComplete) {
      Logger.debug(`Carrier ${carrier.id} could not find path to pickup ${source.id}`);
      continue;
    }

    bestJob.status = "claimed";
    state.transport.queuedJobCount = Math.max(0, (state.transport.queuedJobCount || 0) - 1);
    bestJob.reserved = bestJob.amount;

    const task: CarrierTask = {
      workerId: carrier.id,
      jobId: bestJob.id,
      pickupBuildingId: bestJob.fromBuildingId,
      dropoffBuildingId: bestJob.toBuildingId,
      resourceType: bestJob.resourceType,
      amount: bestJob.amount,
      phase: "toPickup",
      path: pathResult.points,
      pathIndex: 0,
      stepProgress: 0,
    };

    state.transport.activeCarrierTasks[carrier.id] = task;
    carrier.isIdle = false;
  }

  return state;
}

export function findBestJobForCarrier(
  state: EconomySimulationState,
  carrier: WorkerInstance,
  jobs: TransportJob[],
  config: SimulationConfig
): TransportJob | null {
  let best: TransportJob | null = null;
  let bestScore = -Infinity;

  for (const job of jobs) {
    if (job.status !== "queued") continue;

    const source = state.buildings[job.fromBuildingId];
    const target = state.buildings[job.toBuildingId];
    if (!source || !target) continue;

    const targetNeed = getBuildingResourceNeed(target, job.resourceType, config);
    if (targetNeed <= 0) continue;

    let totalReserved = 0;
    for (const otherJob of Object.values(state.transport.jobs)) {
      if (otherJob.fromBuildingId === source.id && otherJob.resourceType === job.resourceType) {
        totalReserved += otherJob.reserved;
      }
    }

    const sourceAmount = getResourceAmount(source.outputBuffer, job.resourceType);
    const available = sourceAmount - totalReserved;

    if (available < job.amount) continue;

    const carrierToSourcePath = findPath(carrier.position, source.position, state);
    const sourceToTargetPath = findPath(source.position, target.position, state);

    const dist =
      calculatePathDistance(carrierToSourcePath) +
      calculatePathDistance(sourceToTargetPath);

    const score = job.priority * 100 - dist;
    if (score > bestScore) {
      best = job;
      bestScore = score;
    }
  }

  return best;
}

// =========================
// CARRIER MOVEMENT
// =========================

export function getTileAtPosition(territory: TerritoryState, pos: Position): MapTile | undefined {
  if (!territory) return undefined;
  if (territory.tileIndex) {
    const id = territory.tileIndex[`${pos.x},${pos.y}`];
    return id ? territory.tiles[id] : undefined;
  }
  return territory.tiles[`tile_${pos.x}_${pos.y}`];
}

export function recomputeTierFromFootfall(tile: MapTile, thresholds: Record<string, number>) {
  if (tile.footfall >= thresholds.paved) {
    tile.tier = "paved";
  } else if (tile.footfall >= thresholds.cobble) {
    tile.tier = "cobble";
  } else if (tile.footfall >= thresholds.dirt) {
    tile.tier = "dirt";
  } else {
    tile.tier = "grass";
  }
}

export function advanceCarrierMovement(
  state: EconomySimulationState,
  deltaSec: number,
  config: SimulationConfig
): EconomySimulationState {
  for (const [workerId, task] of Object.entries(state.transport.activeCarrierTasks)) {
    const carrier = state.workers[workerId];
    const source = state.buildings[task.pickupBuildingId];
    const target = state.buildings[task.dropoffBuildingId];
    const job = state.transport.jobs[task.jobId];

    if (!carrier || !source || !target || !job) {
      if (job) {
        const wasQueued = job.status === "queued";
        job.status = "lost";
        if (wasQueued) {
          state.transport.queuedJobCount = Math.max(0, (state.transport.queuedJobCount || 0) - 1);
        }
        job.reserved = Math.max(0, job.reserved - task.amount);
      }
      if (carrier) {
        carrier.isIdle = true;
      }
      delete state.transport.activeCarrierTasks[workerId];
      continue;
    }

    const currentPos = task.path[task.pathIndex];
    if (!currentPos) continue;

    const currentTile = getTileAtPosition(state.territory as TerritoryState, currentPos);
    let speedMult = currentTile ? (config.tierSpeedMultipliers[currentTile.tier] || 1) : 1;

    if (task.phase === "toDropoff" && config.carrierEncumbrancePenalty) {
      const workerDef = WORKER_DEFINITIONS[carrier.type];
      const capacity = workerDef ? workerDef.carryCapacity : 1;
      const loadRatio = clamp(task.amount / capacity, 0, 1);
      const encumbranceMultiplier = 1 - (loadRatio * config.carrierEncumbrancePenalty);
      speedMult *= encumbranceMultiplier;
    }

    const step = config.carrierBaseSpeed * speedMult * deltaSec;

    task.stepProgress += step;

    while (task.stepProgress >= 1 && task.pathIndex + 1 < task.path.length) {
      task.stepProgress -= 1;
      task.pathIndex += 1;

      const newPos = task.path[task.pathIndex];
      carrier.position = { ...newPos };

      const steppedTile = getTileAtPosition(state.territory as TerritoryState, newPos);
      if (steppedTile) {
        steppedTile.footfall += 1;
        recomputeTierFromFootfall(steppedTile, config.footfallTierThresholds);
      }
    }

    // stepProgress accumulates fractional sub-tile distance each frame. 0.999 guards
    // against floating-point overshoot at the final node after the while loop drains whole steps.
    const ARRIVAL_THRESHOLD = 0.999;
    if (task.pathIndex === task.path.length - 1 && task.stepProgress >= ARRIVAL_THRESHOLD) {
      if (task.phase === "toPickup") {
        const nextPathResult = findPath(source.position, target.position, state, tierTileCost);
        if (!nextPathResult.isComplete) {
          job.status = "lost";
          job.reserved = Math.max(0, job.reserved - task.amount);
          carrier.isIdle = true;
          delete state.transport.activeCarrierTasks[workerId];
          continue;
        }

        source.outputBuffer = removeResource(source.outputBuffer, task.resourceType, task.amount);

        // Clear reservation so source can accept new jobs
        job.reserved = Math.max(0, job.reserved - task.amount);

        task.phase = "toDropoff";
        task.path = nextPathResult.points;
        task.pathIndex = 0;
        task.stepProgress = 0;
      } else if (task.phase === "toDropoff") {
        if (target.type === "vaultOfDigestiveStone") {
          target.internalStorage = addResource(target.internalStorage, task.resourceType, task.amount);
        } else {
          target.inputBuffer = addResource(target.inputBuffer, task.resourceType, task.amount);
        }

        job.delivered += task.amount;
        job.status = "delivered";

        carrier.isIdle = true;
        delete state.transport.activeCarrierTasks[workerId];
      }
    }
  }

  return state;
}

export function decayFootfall(state: EconomySimulationState, config: SimulationConfig): EconomySimulationState {
  if (state.tick % 10 === 0) {
    if (state.territory && state.territory.tiles) {
      for (const tile of Object.values(state.territory.tiles as Record<string, MapTile>)) {
        if (tile.footfall > 0) {
          tile.footfall = Math.max(0, tile.footfall - config.footfallDecayPerTenTicks);
          recomputeTierFromFootfall(tile, config.footfallTierThresholds);
        }
      }
    }
  }
  return state;
}

// =========================
// METRICS
// =========================

export function updateTransportMetrics(
  state: EconomySimulationState,
  config: SimulationConfig
): EconomySimulationState {
  const queued = state.transport.queuedJobCount ?? 0;
  const active = Object.keys(state.transport.activeCarrierTasks).length;

  state.transport.networkStress =
    queued * config.stressPerQueuedJob + active * config.stressPerActiveCarrier;

  const claimedOrQueued = Object.values(state.transport.jobs).filter(
    (j) => j.status === "queued" || j.status === "claimed"
  );

  if (claimedOrQueued.length === 0) {
    state.transport.averageLatencySec = 0;
  } else {
    const sumDistance = claimedOrQueued.reduce((sum, job) => {
      const from = state.buildings[job.fromBuildingId];
      const to = state.buildings[job.toBuildingId];
      if (!from || !to) return sum;
      return sum + distance(from.position, to.position);
    }, 0);

    state.transport.averageLatencySec = sumDistance / claimedOrQueued.length;
  }

  return state;
}
