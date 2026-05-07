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

export function getTransportIndicatorModel(state: WorldState, ownerId: string): TransportIndicatorModel {
  const active = Object.values(state.transport.activeCarrierTasks ?? {}).filter((task) => {
    const worker = state.workers[task.workerId];
    return worker?.ownerId === ownerId;
  }).length;
  const queued = state.transport.queuedJobCount ?? 0;
  const situation = getSettlementSituationSnapshot(state, ownerId).transport;
  const detail = `${situation.detail} ${situation.action}`;

  return {
    active,
    queued,
    tone: situation.tone,
    summary: `Active ${active} · Queued ${queued}`,
    headline: situation.headline,
    detail,
    title: `${situation.headline}: ${detail}`,
  };
}
