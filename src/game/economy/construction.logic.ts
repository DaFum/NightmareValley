import { EconomySimulationState } from '../core/economy.simulation';
import { advanceBuildingConstruction } from '../entities/buildings/building.logic';

export function processConstruction(
  state: EconomySimulationState,
  deltaSec: number
): EconomySimulationState {
  const buildings = { ...state.buildings };

  for (const [id, building] of Object.entries(buildings)) {
    if (!building.isActive) continue;
    if (building.constructionProgress === undefined) continue;

    const workerCount = building.assignedWorkers.length;
    if (workerCount === 0) continue;

    const effectiveDelta = deltaSec * workerCount;
    const updated = advanceBuildingConstruction(building, effectiveDelta);

    if (updated.constructionProgress === undefined) {
      buildings[id] = { ...updated, level: 1 };
    } else {
      buildings[id] = updated;
    }
  }

  return { ...state, buildings };
}
