import { EconomySimulationState } from "../core/economy.simulation";
import { SimulationConfig } from "./balancing.constants";
import { BuildingInstance } from "../core/game.types";
import { BuildingDefinition } from "../core/economy.types";
import { BUILDING_DEFINITIONS } from "../core/economy.data";
import { cloneState, requiresRoad, hasAssignedWorkersForBuilding } from "../core/economy.simulation";
import { getResourceAmount, addResource } from "./stockpile.logic";

export function processExtraction(
  state: EconomySimulationState,
  deltaSec: number,
  config: SimulationConfig
): EconomySimulationState {
  const next = cloneState(state);

  for (const building of Object.values(next.buildings)) {
    if (!building.isActive) continue;
    if (!building.connectedToRoad && requiresRoad(building.type)) continue;

    const def = BUILDING_DEFINITIONS[building.type];
    if (!def.extraction) continue;
    if (!hasAssignedWorkersForBuilding(next, building)) continue;

    const cycleTime = getExtractionCycleTime(building, def, config);
    if (!Number.isFinite(cycleTime) || cycleTime <= 0) {
      building.progressSec = 0; // Prevent stalls/loops on invalid times
      continue;
    }

    building.progressSec += deltaSec;

    while (building.progressSec >= cycleTime) {
      const currentAmount = getResourceAmount(
        building.outputBuffer,
        def.extraction.resource
      );

      const availableSpace = config.buildingOutputBufferLimit - currentAmount;
      if (availableSpace <= 0) {
        // Keep progress so it completes instantly when space frees up
        building.progressSec = Math.min(building.progressSec, cycleTime);
        break;
      }

      building.progressSec -= cycleTime;
      const amountToAdd = Math.min(def.extraction.amountPerCycle, availableSpace);

      building.outputBuffer = addResource(
        building.outputBuffer,
        def.extraction.resource,
        amountToAdd
      );

      building.corruption = (building.corruption ?? 0) + 0.1;
    }
  }

  return next;
}

export function getExtractionCycleTime(
  building: BuildingInstance,
  def: BuildingDefinition,
  config: SimulationConfig
): number {
  if (!def.extraction) return Number.POSITIVE_INFINITY;

  const levelMultiplier =
    1 + (building.level - 1) * config.extractionLevelBonus;

  return def.extraction.cycleTimeSec / levelMultiplier;
}
