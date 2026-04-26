import type { TileTier } from '../core/game.types';

export interface SimulationConfig {
  defaultTransportPriority: number;
  maxJobsPerTick: number;
  carrierBaseSpeed: number;
  extractionLevelBonus: number;
  recipeLevelSpeedBonus: number;
  /** Small buffer inside each production building (Siedler-2 style). */
  buildingInputBufferLimit: number;
  buildingOutputBufferLimit: number;
  /** How many units a single vault can store per resource. */
  warehouseStorageLimit: number;
  workerMoraleDecayPerTick: number;
  workerMoraleRecoveryIdlePerTick: number;
  workerInfectionGainFromCorruption: number;
  stressPerQueuedJob: number;
  stressPerActiveCarrier: number;
  /** Max units per transport job — should match carrier carryCapacity (1). */
  maxJobBatchSize?: number;
  footfallTierThresholds: Record<TileTier, number>;
  tierSpeedMultipliers: Record<TileTier, number>;
  footfallDecayPerTenTicks: number;
  carrierEncumbrancePenalty: number;
}

export const DEFAULT_SIMULATION_CONFIG: Readonly<SimulationConfig> = Object.freeze({
  defaultTransportPriority: 10,
  maxJobsPerTick: 120,
  carrierBaseSpeed: 1,
  extractionLevelBonus: 0.25,
  recipeLevelSpeedBonus: 0.2,
  // Siedler-2 style: production buildings only keep a small local buffer;
  // the bulk of resources lives in the vault (warehouse).
  buildingInputBufferLimit: 4,
  buildingOutputBufferLimit: 6,
  warehouseStorageLimit: 9999,
  workerMoraleDecayPerTick: 0.15,
  workerMoraleRecoveryIdlePerTick: 0.25,
  workerInfectionGainFromCorruption: 0.05,
  stressPerQueuedJob: 0.2,
  stressPerActiveCarrier: 0.5,
  // Carriers carry 1 unit at a time (matches burdenThrall.carryCapacity).
  maxJobBatchSize: 1,
  footfallTierThresholds: { grass: 0, dirt: 10, cobble: 50, paved: 200 },
  tierSpeedMultipliers: { grass: 1.0, dirt: 1.2, cobble: 1.5, paved: 2.0 },
  footfallDecayPerTenTicks: 0.2,
  carrierEncumbrancePenalty: 0.3,
});
