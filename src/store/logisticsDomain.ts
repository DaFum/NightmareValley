import type { BuildingInstance } from '../game/core/game.types';
import type { ResourceType } from '../game/core/economy.types';
import type { WorldState } from '../game/world/world.types';
import { BUILDING_DEFINITIONS, getWorkerDefinition } from '../game/core/economy.data';
import { DEFAULT_SIMULATION_CONFIG } from '../game/economy/balancing.constants';
import {
  buildingAcceptsResource,
  canTransportBetweenBuildings,
  getEffectiveBuildingResourceNeed,
  getTransportPriority,
  getTransportRouteDiagnostic,
  gridManhattanDistance,
} from '../game/transport';
import { resourceLabel } from './economy.utils';

export type LogisticsTone = 'good' | 'idle' | 'warn' | 'danger';

export type LogisticsSummaryModel = {
  activeJobs: number;
  queuedJobs: number;
  availableCarriers: number;
  totalCarriers: number;
  blockedJobs: number;
  lastCompletedDelivery: string | null;
  nextRequestedDelivery: string | null;
  whyIdle: string;
  recommendation: string;
  headline: string;
  tone: LogisticsTone;
  debugJobs: Array<{
    source: string;
    target: string;
    resource: ResourceType;
    amount: number;
    distance: number;
    pathStatus: 'reachable' | 'blocked';
    reason: string | null;
  }>;
};

type DeliveryCandidate = {
  source: BuildingInstance;
  target: BuildingInstance;
  resource: ResourceType;
  amount: number;
  distance: number;
  priority: number;
  reachable: boolean;
  reason: string | null;
};

const TERMINAL_JOB_STATUSES = new Set(['delivered', 'lost', 'spilled']);
const ACTIVE_JOB_STATUSES = new Set(['queued', 'claimed']);

function buildingName(building: BuildingInstance | undefined): string {
  if (!building) return 'Missing building';
  return BUILDING_DEFINITIONS[building.type]?.name ?? building.type;
}

function countQueuedJobsForOwner(state: WorldState, ownerId: string): number {
  const jobs = Object.values(state.transport?.jobs ?? {});
  if (jobs.length === 0) return state.transport?.queuedJobCount ?? 0;
  return jobs.filter((job) => {
    if (job.status !== 'queued') return false;
    return state.buildings[job.fromBuildingId]?.ownerId === ownerId;
  }).length;
}

function countActiveTasksForOwner(state: WorldState, ownerId: string): number {
  return Object.values(state.transport?.activeCarrierTasks ?? {}).filter((task) => {
    const worker = state.workers[task.workerId];
    return worker?.ownerId === ownerId;
  }).length;
}

function getCarrierCounts(state: WorldState, ownerId: string) {
  const carriers = Object.values(state.workers ?? {}).filter(
    (worker) => worker.ownerId === ownerId && worker.type === 'burdenThrall',
  );
  const activeTaskWorkerIds = new Set(Object.keys(state.transport?.activeCarrierTasks ?? {}));
  const available = carriers.filter((carrier) => carrier.isIdle && !activeTaskWorkerIds.has(carrier.id)).length;
  return {
    total: carriers.length,
    available,
  };
}

function getReservedBySourceResource(state: WorldState): Map<string, number> {
  const reserved = new Map<string, number>();
  for (const job of Object.values(state.transport?.jobs ?? {})) {
    if (!ACTIVE_JOB_STATUSES.has(job.status)) continue;
    const key = `${job.fromBuildingId}:${job.resourceType}`;
    const amount = job.status === 'queued' ? job.amount : Math.max(job.reserved, job.amount - job.delivered);
    reserved.set(key, (reserved.get(key) ?? 0) + amount);
  }
  return reserved;
}

function getNonZeroResourceTypes(buffer: Partial<Record<ResourceType, number>>): ResourceType[] {
  return Object.entries(buffer)
    .filter(([, amount]) => (amount ?? 0) > 0)
    .map(([resource]) => resource as ResourceType);
}

function getDeliveryCandidates(state: WorldState, ownerId: string): DeliveryCandidate[] {
  const candidates: DeliveryCandidate[] = [];
  const buildings = Object.values(state.buildings ?? {});
  const reserved = getReservedBySourceResource(state);
  const carrierCapacity = getWorkerDefinition('burdenThrall').carryCapacity;

  for (const source of buildings) {
    if (source.ownerId !== ownerId || !source.isActive || (source.constructionProgress ?? 1) < 1) continue;

    for (const resource of getNonZeroResourceTypes(source.outputBuffer ?? {})) {
      const sourceKey = `${source.id}:${resource}`;
      const available = (source.outputBuffer?.[resource] ?? 0) - (reserved.get(sourceKey) ?? 0);
      if (available <= 0) continue;

      const targets = buildings.filter((target) => {
        if (target.ownerId !== ownerId || target.id === source.id || !target.isActive || (target.constructionProgress ?? 1) < 1) return false;
        if (source.type === 'vaultOfDigestiveStone' && target.type === 'vaultOfDigestiveStone') return false;
        if (!buildingAcceptsResource(target, resource)) return false;
        return getEffectiveBuildingResourceNeed(state, target, resource, DEFAULT_SIMULATION_CONFIG) > 0;
      });

      for (const target of targets) {
        const needed = getEffectiveBuildingResourceNeed(state, target, resource, DEFAULT_SIMULATION_CONFIG);
        const amount = Math.min(available, needed, carrierCapacity, DEFAULT_SIMULATION_CONFIG.maxJobBatchSize ?? carrierCapacity);
        if (amount <= 0) continue;
        const reachable = canTransportBetweenBuildings(state, source, target);
        candidates.push({
          source,
          target,
          resource,
          amount,
          distance: gridManhattanDistance(source.position, target.position),
          priority: getTransportPriority(target, resource, DEFAULT_SIMULATION_CONFIG),
          reachable,
          reason: reachable ? null : getTransportRouteDiagnostic(state, source, target) ?? 'no road path',
        });
      }
    }
  }

  return candidates.sort((a, b) => {
    if (b.reachable !== a.reachable) return Number(b.reachable) - Number(a.reachable);
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.distance - b.distance;
  });
}

function getAnyDemandExists(state: WorldState, ownerId: string): boolean {
  return Object.values(state.buildings ?? {}).some((target) => {
    if (target.ownerId !== ownerId || !target.isActive || (target.constructionProgress ?? 1) < 1) return false;
    return Object.values(state.buildings ?? {}).some((source) => {
      if (source.ownerId !== ownerId || source.id === target.id) return false;
      return getNonZeroResourceTypes(source.outputBuffer ?? {}).some((resource) => {
        if (source.type === 'vaultOfDigestiveStone' && target.type === 'vaultOfDigestiveStone') return false;
        return buildingAcceptsResource(target, resource)
          && getEffectiveBuildingResourceNeed(state, target, resource, DEFAULT_SIMULATION_CONFIG) > 0;
      });
    });
  });
}

function getAnySourceHasOutput(state: WorldState, ownerId: string): boolean {
  return Object.values(state.buildings ?? {}).some(
    (building) => building.ownerId === ownerId && getNonZeroResourceTypes(building.outputBuffer ?? {}).length > 0,
  );
}

function formatCandidate(candidate: DeliveryCandidate | null): string | null {
  if (!candidate) return null;
  return `${candidate.amount} ${resourceLabel(candidate.resource)}: ${buildingName(candidate.source)} -> ${buildingName(candidate.target)}`;
}

function formatCompletedDelivery(state: WorldState, ownerId: string): string | null {
  const completed = Object.values(state.transport?.jobs ?? {}).find((job) => {
    if (!TERMINAL_JOB_STATUSES.has(job.status)) return false;
    return state.buildings[job.fromBuildingId]?.ownerId === ownerId;
  });
  if (!completed) return null;
  return `${completed.delivered || completed.amount} ${resourceLabel(completed.resourceType)} delivered to ${buildingName(state.buildings[completed.toBuildingId])}`;
}

export function getLogisticsSummaryModel(state: WorldState, ownerId: string): LogisticsSummaryModel {
  const activeJobs = countActiveTasksForOwner(state, ownerId);
  const queuedJobs = countQueuedJobsForOwner(state, ownerId);
  const carriers = getCarrierCounts(state, ownerId);
  const candidates = getDeliveryCandidates(state, ownerId);
  const blocked = candidates.filter((candidate) => !candidate.reachable);
  const reachable = candidates.find((candidate) => candidate.reachable) ?? null;
  const blockedFirst = blocked[0] ?? null;
  const nextRequestedDelivery = formatCandidate(reachable ?? blockedFirst);
  const lastCompletedDelivery = formatCompletedDelivery(state, ownerId);

  let tone: LogisticsTone = 'idle';
  let headline = 'Logistics idle';
  let whyIdle = 'Idle: all deliveries are complete.';
  let recommendation = 'Watch demand before expanding roads.';

  if (activeJobs > 0) {
    tone = 'good';
    headline = 'Transport moving';
    whyIdle = `${activeJobs} carrier${activeJobs === 1 ? ' is' : 's are'} moving goods now.`;
    recommendation = 'Hover or select a carrier to inspect its source, target, route, and cargo.';
  } else if (queuedJobs > 0 && carriers.available === 0) {
    tone = 'warn';
    headline = 'Waiting for carriers';
    whyIdle = `Waiting: ${queuedJobs} job${queuedJobs === 1 ? '' : 's'} need a carrier, but none are free.`;
    recommendation = 'Hire Burden Thralls or wait for a carrier to finish its route.';
  } else if (queuedJobs > 0) {
    tone = 'warn';
    headline = 'Jobs queued';
    whyIdle = `Queued: ${queuedJobs} delivery job${queuedJobs === 1 ? '' : 's'} awaiting assignment.`;
    recommendation = nextRequestedDelivery ?? 'Inspect queued jobs in the logistics details.';
  } else if (blocked.length > 0) {
    tone = 'warn';
    headline = 'Deliveries blocked';
    whyIdle = `Blocked: ${blocked.length} potential deliver${blocked.length === 1 ? 'y has' : 'ies have'} no road path.`;
    recommendation = 'Connect the source and target with scar paths.';
  } else if (!getAnyDemandExists(state, ownerId)) {
    tone = 'idle';
    headline = 'No delivery demand';
    whyIdle = 'Idle: no building currently requests resources.';
    recommendation = getAnySourceHasOutput(state, ownerId)
      ? 'Build a production building to create delivery demand.'
      : 'Build an extractor or producer so resources enter the network.';
  } else if (!getAnySourceHasOutput(state, ownerId)) {
    tone = 'warn';
    headline = 'No source resources';
    whyIdle = 'Idle: buildings request resources, but no connected source has output available.';
    recommendation = 'Start the upstream resource chain or wait for production output.';
  } else if (carriers.total === 0) {
    tone = 'warn';
    headline = 'No carriers recruited';
    whyIdle = 'Idle: no Burden Thralls are available for transport.';
    recommendation = 'Hire Burden Thralls from the vault before relying on logistics.';
  }

  return {
    activeJobs,
    queuedJobs,
    availableCarriers: carriers.available,
    totalCarriers: carriers.total,
    blockedJobs: blocked.length,
    lastCompletedDelivery,
    nextRequestedDelivery,
    whyIdle,
    recommendation,
    headline,
    tone,
    debugJobs: candidates.slice(0, 12).map((candidate) => ({
      source: buildingName(candidate.source),
      target: buildingName(candidate.target),
      resource: candidate.resource,
      amount: candidate.amount,
      distance: candidate.distance,
      pathStatus: candidate.reachable ? 'reachable' : 'blocked',
      reason: candidate.reason,
    })),
  };
}
