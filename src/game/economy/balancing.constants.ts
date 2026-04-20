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
}

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
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
};
