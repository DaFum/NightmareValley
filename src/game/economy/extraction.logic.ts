import { EconomySimulationState } from "../core/economy.simulation";
import { SimulationConfig } from "./balancing.constants";
import { BuildingInstance, MapTile } from "../core/game.types";
import { BuildingDefinition, ResourceType } from "../core/economy.types";
import { BUILDING_DEFINITIONS } from "../core/economy.data";
import { requiresRoad, hasAssignedWorkersForBuilding, clamp } from "../core/economy.simulation";
import { getResourceAmount, addResource } from "./stockpile.logic";
import { getTileAt } from "../map/map.query";

const RENEWABLE_EXTRACTIONS = new Set<ResourceType>(["pigFleshMass"]);
const EXTRACTION_SEARCH_RADIUS = 2;

export function processExtraction(
  state: EconomySimulationState,
  deltaSec: number,
  config: SimulationConfig
): EconomySimulationState {
  for (const building of Object.values(state.buildings)) {
    if (!building.isActive) continue;
    if (!building.connectedToRoad && requiresRoad(building.type)) continue;

    const def = BUILDING_DEFINITIONS[building.type];
    if (!def.extraction) continue;
    if (!hasAssignedWorkersForBuilding(state, building)) continue;

    const cycleTime = getExtractionCycleTime(building, def, config);
    if (!Number.isFinite(cycleTime) || cycleTime <= 0) {
      building.progressSec = 0; // Prevent stalls/loops on invalid times
      continue;
    }

    building.progressSec += deltaSec;

    let depositTile = findExtractionDepositTile(state, building, def.extraction.resource);

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

      if (!depositTile || (depositTile.resourceDeposit?.[def.extraction.resource] ?? 0) <= 0) {
        depositTile = findExtractionDepositTile(state, building, def.extraction.resource);
      }
      const depositAmount = depositTile?.resourceDeposit?.[def.extraction.resource] ?? 0;
      const isRenewable = RENEWABLE_EXTRACTIONS.has(def.extraction.resource);

      if (!isRenewable && depositAmount <= 0) {
        building.progressSec = Math.min(building.progressSec, cycleTime);
        break;
      }

      building.progressSec -= cycleTime;
      const amountToAdd = Math.min(
        def.extraction.amountPerCycle,
        availableSpace,
        isRenewable ? Number.POSITIVE_INFINITY : depositAmount
      );

      if (amountToAdd <= 0 || !Number.isFinite(amountToAdd)) {
        building.progressSec = Math.min(building.progressSec, cycleTime);
        break;
      }

      building.outputBuffer = addResource(
        building.outputBuffer,
        def.extraction.resource,
        amountToAdd
      );

      if (!isRenewable && depositTile?.resourceDeposit) {
        depositTile.resourceDeposit[def.extraction.resource] = Math.max(
          0,
          depositAmount - amountToAdd
        );
      }

      building.corruption = clamp((building.corruption ?? 0) + 0.1, 0, 100);
    }
  }

  return state;
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

export function findExtractionDepositTile(
  state: EconomySimulationState,
  building: BuildingInstance,
  resourceType: ResourceType
): MapTile | null {
  let best: MapTile | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let dy = -EXTRACTION_SEARCH_RADIUS; dy <= EXTRACTION_SEARCH_RADIUS; dy++) {
    for (let dx = -EXTRACTION_SEARCH_RADIUS; dx <= EXTRACTION_SEARCH_RADIUS; dx++) {
      const tx = building.position.x + dx;
      const ty = building.position.y + dy;
      const tile = getTileAt(state.territory, tx, ty);
      const amount = tile?.resourceDeposit?.[resourceType] ?? 0;
      if (!tile || amount <= 0) continue;

      const distance = Math.abs(dx) + Math.abs(dy);
      if (distance < bestDistance) {
        best = tile;
        bestDistance = distance;
      }
    }
  }

  return best;
}
