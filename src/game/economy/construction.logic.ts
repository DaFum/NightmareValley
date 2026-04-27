import { EconomySimulationState, spawnWorker, assignWorkerToBuilding } from '../core/economy.simulation';
import { advanceBuildingConstruction } from '../entities/buildings/building.logic';
import { BUILDING_DEFINITIONS } from '../core/economy.data';
import { WorkerType } from '../core/economy.types';
import { isWorkerAtBuilding } from '../entities/workers/worker.logic';

export function processConstruction(
  state: EconomySimulationState,
  deltaSec: number
): EconomySimulationState {
  const buildings = { ...state.buildings };

  for (const [id, building] of Object.entries(buildings)) {
    if (!building.isActive) continue;
    if (building.constructionProgress === undefined) continue;

    const arrivedCount = building.assignedWorkers.filter(wId => {
      const w = state.workers[wId];
      return w && w.position && isWorkerAtBuilding(w.position, building.position);
    }).length;
    if (arrivedCount === 0) continue;

    const effectiveDelta = deltaSec * arrivedCount;
    const updated = advanceBuildingConstruction(building, effectiveDelta);

    if (updated.constructionProgress === undefined) {
      buildings[id] = { ...updated, level: 1 };
    } else {
      buildings[id] = updated;
    }
  }

  return { ...state, buildings };
}

export function autoSpawnConstructionWorkers(
  state: EconomySimulationState
): EconomySimulationState {
  let next = state;

  for (const building of Object.values(next.buildings)) {
    const currentBuilding = next.buildings[building.id];
    if (currentBuilding.constructionProgress === undefined) continue;
    if (currentBuilding.assignedWorkers.length > 0) continue;

    const player = next.players[currentBuilding.ownerId];
    if (!player) continue;

    const vault = player.buildings
      .map(id => next.buildings[id])
      .find(b => b && b.type === "vaultOfDigestiveStone");
    if (!vault) continue;

    const def = BUILDING_DEFINITIONS[currentBuilding.type];
    const workerType = Object.entries(def.workerSlots).find(([, slots]) => slots > 0)?.[0] as WorkerType | undefined;
    if (!workerType) continue;

    try {
      next = spawnWorker(next, currentBuilding.ownerId, workerType, vault.position);
      const newWorkerId = next.players[currentBuilding.ownerId].workers[next.players[currentBuilding.ownerId].workers.length - 1];
      // Worker's homeBuildingId will be set to the construction building — intentional,
      // they transition to production worker here after construction completes.
      next = assignWorkerToBuilding(next, newWorkerId, currentBuilding.id);
    } catch {
      // Population limit reached or other spawn failure — retry next tick
    }
  }

  return next;
}
