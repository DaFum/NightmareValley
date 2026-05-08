import type { WorldState } from '../game/world/world.types';
import { getSettlementSituationSnapshot, type SettlementSituationTone } from '../game/economy/economy.planner';

export type TransportIndicatorModel = {
  active: number;
  queued: number;
  tone: SettlementSituationTone;
  summary: string;
  headline: string;
  detail: string;
  title: string;
};

function getQueuedJobsForOwner(state: WorldState, ownerId: string): number {
  const jobs = Object.values(state.transport.jobs ?? {});
  if (jobs.length === 0) return state.transport.queuedJobCount ?? 0;
  return jobs.filter((job) => {
    if (job.status !== 'queued') return false;
    const source = state.buildings[job.fromBuildingId];
    return source?.ownerId === ownerId;
  }).length;
}

function getActiveTasksForOwner(state: WorldState, ownerId: string): number {
  return Object.values(state.transport.activeCarrierTasks ?? {}).filter((task) => {
    const worker = state.workers[task.workerId];
    return worker?.ownerId === ownerId;
  }).length;
}

function getIndicatorDetail(headline: string, detail: string): Pick<TransportIndicatorModel, 'detail' | 'title' | 'headline'> {
  const normalizedDetail = detail.trim();
  const title = normalizedDetail ? `${headline}: ${normalizedDetail}` : headline;
  return {
    headline,
    detail: normalizedDetail,
    title,
  };
}

export function getTransportIndicatorModel(state: WorldState, ownerId: string): TransportIndicatorModel {
  const active = getActiveTasksForOwner(state, ownerId);
  const queued = getQueuedJobsForOwner(state, ownerId);
  const situation = getSettlementSituationSnapshot(state, ownerId).transport;
  const detailModel = getIndicatorDetail(situation.headline, `${situation.detail} ${situation.action}`);

  return {
    active,
    queued,
    tone: situation.tone,
    summary: `Active ${active} · Queued ${queued}`,
    ...detailModel,
  };
}
