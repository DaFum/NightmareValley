import { ResourceType } from "../core/economy.types";
import { EconomySimulationState, mergeInventoryInto } from "../core/economy.simulation";

export interface EconomySnapshot {
  tick: number;
  worldPulse: number;
  totalBuildings: number;
  totalWorkers: number;
  queuedJobs: number;
  activeCarrierTasks: number;
  totalStoredResources: Partial<Record<ResourceType, number>>;
}

export function createEconomySnapshot(
  state: EconomySimulationState
): EconomySnapshot {
  const totalStoredResources: Partial<Record<ResourceType, number>> = {};

  for (const building of Object.values(state.buildings)) {
    mergeInventoryInto(totalStoredResources, building.inputBuffer);
    mergeInventoryInto(totalStoredResources, building.outputBuffer);
    mergeInventoryInto(totalStoredResources, building.internalStorage);
  }

  for (const player of Object.values(state.players)) {
    mergeInventoryInto(totalStoredResources, player.stock);
  }

  return {
    tick: state.tick,
    worldPulse: state.worldPulse,
    totalBuildings: Object.keys(state.buildings).length,
    totalWorkers: Object.keys(state.workers).length,
    queuedJobs: Object.values(state.transport.jobs).filter((j) => j.status === "queued").length,
    activeCarrierTasks: Object.keys(state.transport.activeCarrierTasks).length,
    totalStoredResources,
  };
}
