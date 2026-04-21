import { BuildingId, WorkerId } from "../core/entity.ids";
import { Position, BuildingInstance, WorkerInstance } from "../core/game.types";
import { ResourceType, WorkerDefinition } from "../core/economy.types";
import { EconomySimulationState, createId, distance, clamp, getNonZeroResources } from "../core/economy.simulation";
import { SimulationConfig, DEFAULT_SIMULATION_CONFIG } from "./balancing.constants";
import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from "../core/economy.data";
import { RECIPES } from "./recipes.data";
import { getResourceAmount, addResource, removeResource } from "./stockpile.logic";

export interface RoadNode {
  id: string;
  position: Position;
  connectedNodeIds: string[];
  pressure?: number;
}

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
  progress: number;
}

export interface TransportState {
  roadNodes: Record<string, RoadNode>;
  jobs: Record<string, TransportJob>;
  activeCarrierTasks: Record<string, CarrierTask>;
  networkStress: number;
  averageLatencySec: number;
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
      const amountAvailable = getResourceAmount(source.outputBuffer, resourceType);
      if (amountAvailable <= 0) continue;

      const targets = findTargetBuildingsForResource(state, source, resourceType, config);

      for (const target of targets) {
        if (created >= config.maxJobsPerTick) break;

        const neededAmount = getBuildingResourceNeed(target, resourceType, config);
        if (neededAmount <= 0) continue;

        const carrierCapacity = WORKER_DEFINITIONS["burdenThrall"].carryCapacity;
        const amountToMove = Math.min(config.maxJobBatchSize || carrierCapacity, amountAvailable, neededAmount);
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
    const aDistance = distance(source.position, a.position);
    const bDistance = distance(source.position, b.position);

    if (bNeed !== aNeed) return bNeed - aNeed;
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

    const bestJob = findBestJobForCarrier(state, carrier, ownerJobs);
    if (!bestJob) continue;

    bestJob.status = "claimed";
    bestJob.reserved = bestJob.amount;

    const task: CarrierTask = {
      workerId: carrier.id,
      jobId: bestJob.id,
      pickupBuildingId: bestJob.fromBuildingId,
      dropoffBuildingId: bestJob.toBuildingId,
      resourceType: bestJob.resourceType,
      amount: bestJob.amount,
      progress: 0,
    };

    state.transport.activeCarrierTasks[carrier.id] = task;
    carrier.isIdle = false;
  }

  return state;
}

export function findBestJobForCarrier(
  state: EconomySimulationState,
  carrier: WorkerInstance,
  jobs: TransportJob[]
): TransportJob | null {
  let best: TransportJob | null = null;
  let bestScore = -Infinity;

  for (const job of jobs) {
    if (job.status !== "queued") continue;

    const source = state.buildings[job.fromBuildingId];
    const target = state.buildings[job.toBuildingId];
    if (!source || !target) continue;

    const targetNeed = getBuildingResourceNeed(target, job.resourceType, DEFAULT_SIMULATION_CONFIG);
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

    const dist =
      distance(carrier.position, source.position) +
      distance(source.position, target.position);

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

export function moveCarrierTasks(
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
        if (!source || !target) {
          job.status = "lost"; // Terminal state, no source/target exists to fulfill it
          job.reserved = Math.max(0, job.reserved - task.amount);
        } else {
          job.status = "queued";
          job.reserved = Math.max(0, job.reserved - task.amount);
        }
      }
      if (carrier) {
        carrier.isIdle = true;
      }
      delete state.transport.activeCarrierTasks[workerId];
      continue;
    }

    const workerDef = WORKER_DEFINITIONS[carrier.type];
    const totalDistance =
      distance(source.position, target.position) + 1;

    const speed = getCarrierSpeed(workerDef, deltaSec, config);
    task.progress += speed / totalDistance;

    carrier.morale = clamp(carrier.morale - 0.1 * deltaSec, 0, 100);

    if (task.progress >= 1) {
      task.progress = 1;
    }
  }

  return state;
}

export function getCarrierSpeed(
  workerDef: WorkerDefinition,
  deltaSec: number,
  config: SimulationConfig
): number {
  return workerDef.moveSpeed * config.carrierBaseSpeed * deltaSec;
}

// =========================
// DELIVERY
// =========================

export function deliverCarrierTasks(
  state: EconomySimulationState,
  config: SimulationConfig
): EconomySimulationState {
  for (const [workerId, task] of Object.entries(state.transport.activeCarrierTasks)) {
    if (task.progress < 1) continue;

    const carrier = state.workers[workerId];
    const source = state.buildings[task.pickupBuildingId];
    const target = state.buildings[task.dropoffBuildingId];
    const job = state.transport.jobs[task.jobId];

    if (!carrier || !source || !target || !job) {
      if (job) {
        if (!source || !target) {
          job.status = "lost";
          job.reserved = Math.max(0, job.reserved - task.amount);
        } else {
          job.status = "queued";
          job.reserved = Math.max(0, job.reserved - task.amount);
        }
      }
      if (carrier) {
        carrier.isIdle = true;
      }
      delete state.transport.activeCarrierTasks[workerId];
      continue;
    }

    const availableFromSource = getResourceAmount(source.outputBuffer, task.resourceType);
    const targetNeed = getBuildingResourceNeed(target, task.resourceType, config);

    const moved = Math.min(task.amount, availableFromSource, targetNeed);

    if (moved > 0) {
      source.outputBuffer = removeResource(source.outputBuffer, task.resourceType, moved);

      if (target.type === "vaultOfDigestiveStone") {
        target.internalStorage = addResource(target.internalStorage, task.resourceType, moved);
      } else {
        target.inputBuffer = addResource(target.inputBuffer, task.resourceType, moved);
      }

      job.delivered += moved;
      job.status = "delivered";
    } else {
      if (targetNeed === 0) {
        job.status = "lost"; // Treating "lost" as terminal per types, but meaning "cancelled"
      } else if (availableFromSource === 0) {
        job.status = "queued";
      } else {
        job.status = "lost";
      }
    }

    // Safely clear reservation upon completion or failure
    job.reserved = Math.max(0, job.reserved - task.amount);

    carrier.position = { ...target.position };
    carrier.isIdle = true;

    delete state.transport.activeCarrierTasks[workerId];
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
  const queued = Object.values(state.transport.jobs).filter((j) => j.status === "queued").length;
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
