import { BuildingId, WorkerId } from "../core/entity.ids";
import { Position, BuildingInstance, WorkerInstance } from "../core/game.types";
import Logger from "../../lib/logger";
import { ResourceType } from "../core/economy.types";
import { EconomySimulationState, createId, clamp, getNonZeroResources } from "../core/economy.simulation";
import { SimulationConfig } from "./balancing.constants";
import { BUILDING_DEFINITIONS, getWorkerDefinition } from "../core/economy.data";
import { RECIPES } from "./recipes.data";
import { getResourceAmount, addResource, removeResource } from "./stockpile.logic";
import { findPath, tierTileCost } from "../pathing/path.a-star";
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

export function gridManhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// =========================
// TRANSPORT JOB FACTORY
// =========================

export function createTransportJob(
  id: string,
  fromBuildingId: BuildingId,
  toBuildingId: BuildingId,
  resourceType: ResourceType,
  amount: number,
  priority: number,
  description?: string
): TransportJob {
  return {
    id,
    fromBuildingId,
    toBuildingId,
    resourceType,
    amount,
    priority,
    reserved: 0,
    delivered: 0,
    status: "queued",
    description,
  };
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
          // Queued jobs have reserved=0 but their amount represents pending demand on the source.
          totalReserved += j.status === "queued" ? j.amount : j.reserved;
        }
      }
      const amountAvailable = getResourceAmount(source.outputBuffer, resourceType) - totalReserved;
      if (amountAvailable <= 0) continue;

      const targets = findTargetBuildingsForResource(state, source, resourceType, config);

      for (const target of targets) {
        if (created >= config.maxJobsPerTick) break;

        const neededAmount = getBuildingResourceNeed(target, resourceType, config);
        if (neededAmount <= 0) continue;

        const carrierCapacity = getWorkerDefinition("burdenThrall").carryCapacity;
        const amountToMove = Math.min(config.maxJobBatchSize ?? carrierCapacity, carrierCapacity, amountAvailable, neededAmount);
        if (amountToMove <= 0) continue;

        const signature = `${source.id}->${target.id}:${resourceType}`;
        if (existingJobSignatures.has(signature)) continue;

        const jobId = createId("job");
        state.transport.jobs[jobId] = createTransportJob(
          jobId,
          source.id,
          target.id,
          resourceType,
          amountToMove,
          getTransportPriority(target, resourceType, config),
          `Move ${resourceType} from ${source.type} to ${target.type}`
        );
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

    // Use Manhattan distance as a cheap deterministic tiebreaker.
    // Full A* in a sort comparator can become O(n log n * pathfind) and dominate job generation.
    const aDistance = gridManhattanDistance(source.position, a.position);
    const bDistance = gridManhattanDistance(source.position, b.position);

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
        // Queued jobs use amount as pending demand; claimed jobs use reserved.
        totalReserved += otherJob.status === "queued" ? otherJob.amount : otherJob.reserved;
      }
    }

    const sourceAmount = getResourceAmount(source.outputBuffer, job.resourceType);
    const available = sourceAmount - totalReserved;

    if (available < job.amount) continue;

    // Use Manhattan distance for scoring to avoid O(n*jobs) A* searches here;
    // the real A* path is computed once for the winning job in assignCarrierTasks.
    const carrierToSourceDist = gridManhattanDistance(carrier.position, source.position);
    const sourceToTargetDist = gridManhattanDistance(source.position, target.position);
    const dist = carrierToSourceDist + sourceToTargetDist;

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
  // Use existing tileIndex when available; lazily build it when missing
  if (!territory.tileIndex) {
    territory.tileIndex = {};
    for (const [id, tile] of Object.entries(territory.tiles)) {
      territory.tileIndex[`${tile.position.x},${tile.position.y}`] = id;
    }
  }
  const id = territory.tileIndex[`${pos.x},${pos.y}`];
  return id ? territory.tiles[id] : undefined;
}

export function validateFootfallThresholds(thresholds: Record<string, number>): void {
  if (!(thresholds.dirt <= thresholds.cobble && thresholds.cobble <= thresholds.paved)) {
    console.error(
      `[transport.logic] footfallTierThresholds are misordered: expected dirt (${thresholds.dirt}) <= cobble (${thresholds.cobble}) <= paved (${thresholds.paved})`
    );
  }
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
    if (!currentPos) {
      Logger.debug(`Carrier ${workerId} has no current position for job ${task.jobId}; marking lost`);
      job.status = "lost";
      job.reserved = Math.max(0, job.reserved - task.amount);
      carrier.isIdle = true;
      delete state.transport.activeCarrierTasks[workerId];
      continue;
    }

    const workerDef = getWorkerDefinition(carrier.type);
    const workerMoveSpeed = workerDef?.moveSpeed ?? 1;
    const encumbranceMultiplier = (() => {
      if (task.phase !== "toDropoff" || !config.carrierEncumbrancePenalty) return 1;
      const capacity = workerDef ? workerDef.carryCapacity : 1;
      const loadRatio = clamp(task.amount / capacity, 0, 1);
      return clamp(1 - (loadRatio * config.carrierEncumbrancePenalty), 0.05, 1);
    })();
    const baseMoveSpeed = config.carrierBaseSpeed * workerMoveSpeed * encumbranceMultiplier;

    let reachedDestinationThisTick = false;

    // Single-point path means the carrier is already at its destination tile.
    // Skip accumulation and arrive immediately rather than waiting ~10 ticks.
    if (task.path.length === 1) {
      if (deltaSec > 0) {
        task.stepProgress = 1.0;
        reachedDestinationThisTick = true;
      }
    } else {
      let remainingTime = deltaSec;
      while (remainingTime > 0 && task.pathIndex + 1 < task.path.length) {
        // Use destination-tile speed to match A*'s weighted edge model: cost(A→B) = 1/multiplier[B].
        const destPos = task.path[task.pathIndex + 1];
        const destTile = getTileAtPosition(state.territory as TerritoryState, destPos);
        const tierSpeed = destTile ? (config.tierSpeedMultipliers[destTile.tier] || 1) : 1;
        const edgeSpeed = Math.max(0, baseMoveSpeed * tierSpeed);
        if (edgeSpeed <= 0) break;

        const progressToNextTile = 1 - task.stepProgress;
        const timeToNextTile = progressToNextTile / edgeSpeed;

        if (remainingTime < timeToNextTile) {
          task.stepProgress += remainingTime * edgeSpeed;
          remainingTime = 0;
          break;
        }

        remainingTime -= timeToNextTile;
        task.stepProgress = 0;
        task.pathIndex += 1;
        if (task.pathIndex === task.path.length - 1) {
          reachedDestinationThisTick = true;
        }

        const newPos = task.path[task.pathIndex];
        carrier.position = { ...newPos };

        const steppedTile = getTileAtPosition(state.territory as TerritoryState, newPos);
        if (steppedTile) {
          const prevFootfall = steppedTile.footfall;
          steppedTile.footfall += 1;
          // Recompute tier only when a boundary is crossed; avoids redundant work on hot paths.
          const thresh = config.footfallTierThresholds;
          if (
            (steppedTile.footfall >= thresh.paved  && prevFootfall < thresh.paved)  ||
            (steppedTile.footfall >= thresh.cobble && prevFootfall < thresh.cobble) ||
            (steppedTile.footfall >= thresh.dirt   && prevFootfall < thresh.dirt)
          ) {
            recomputeTierFromFootfall(steppedTile, thresh);
          }
        }
      }
    }

    // stepProgress accumulates fractional sub-tile distance each frame. 0.999 guards
    // against floating-point overshoot at the final node after the while loop drains whole steps.
    const ARRIVAL_THRESHOLD = 0.999;
    if (
      task.pathIndex === task.path.length - 1 &&
      (task.stepProgress >= ARRIVAL_THRESHOLD || reachedDestinationThisTick)
    ) {
      if (task.phase === "toPickup") {
        const nextPathResult = findPath(source.position, target.position, state, tierTileCost);
        if (!nextPathResult.isComplete) {
          job.status = "lost";
          job.reserved = Math.max(0, job.reserved - task.amount);
          carrier.isIdle = true;
          delete state.transport.activeCarrierTasks[workerId];
          continue;
        }

        // Guard against reservation drift: verify source still holds enough before removing.
        // removeResource throws if the buffer is short, which would crash the simulation.
        const availableAtPickup = getResourceAmount(source.outputBuffer, task.resourceType);
        if (availableAtPickup < task.amount) {
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
    validateFootfallThresholds(config.footfallTierThresholds);
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
      return sum + gridManhattanDistance(from.position, to.position);
    }, 0);
    // Convert tile distance to a seconds estimate using baseline carrier speed
    // (encumbrance/terrain/path effects are intentionally excluded from this coarse metric).
    const baselineTilesPerSec = Math.max(
      0.0001,
      config.carrierBaseSpeed * (getWorkerDefinition("burdenThrall")?.moveSpeed ?? 1)
    );
    state.transport.averageLatencySec = (sumDistance / claimedOrQueued.length) / baselineTilesPerSec;
  }

  return state;
}
