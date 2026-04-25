import type { TileTier } from '../core/game.types';

export interface SimulationConfig {
  defaultTransportPriority: number;
  maxJobsPerTick: number;
  carrierBaseSpeed: number;
  extractionLevelBonus: number; // e.g. 0.25 => +25% per level above 1
  recipeLevelSpeedBonus: number; // e.g. 0.2 => faster per level
  buildingInputBufferLimit: number;
  buildingOutputBufferLimit: number;
  workerMoraleDecayPerTick: number;
  workerMoraleRecoveryIdlePerTick: number;
  workerInfectionGainFromCorruption: number;
  stressPerQueuedJob: number;
  stressPerActiveCarrier: number;
  maxJobBatchSize?: number;
  footfallTierThresholds: Record<TileTier, number>;
  tierSpeedMultipliers: Record<TileTier, number>;
  footfallDecayPerTenTicks: number;
  carrierEncumbrancePenalty: number; // e.g. 0.3 means 30% speed reduction at max capacity
}

export const DEFAULT_SIMULATION_CONFIG: Readonly<SimulationConfig> = Object.freeze({
  defaultTransportPriority: 10,
  maxJobsPerTick: 100,
  carrierBaseSpeed: 1,
  extractionLevelBonus: 0.25,
  recipeLevelSpeedBonus: 0.2,
  buildingInputBufferLimit: 20,
  buildingOutputBufferLimit: 20,
  workerMoraleDecayPerTick: 0.15,
  workerMoraleRecoveryIdlePerTick: 0.25,
  workerInfectionGainFromCorruption: 0.05,
  stressPerQueuedJob: 0.2,
  stressPerActiveCarrier: 0.5,
  maxJobBatchSize: 10,
  footfallTierThresholds: { grass: 0, dirt: 10, cobble: 50, paved: 200 },
  tierSpeedMultipliers: { grass: 1.0, dirt: 1.2, cobble: 1.5, paved: 2.0 },
  footfallDecayPerTenTicks: 0.2,
  carrierEncumbrancePenalty: 0.3,
});
