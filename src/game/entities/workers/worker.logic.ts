import { EconomySimulationState } from "../../core/economy.simulation";
import { SimulationConfig } from "../../economy/balancing.constants";
import { findPath } from "../../pathing/path.a-star";

const MOVE_SPEED = 1.0; // grid tiles per second
const ARRIVAL_THRESHOLD = 0.5;

export function isWorkerAtBuilding(
  workerPos: { x: number; y: number },
  buildingPos: { x: number; y: number }
): boolean {
  const dx = workerPos.x - buildingPos.x;
  const dy = workerPos.y - buildingPos.y;
  return Math.sqrt(dx * dx + dy * dy) < ARRIVAL_THRESHOLD;
}

export function updateWorkersAI(
  state: EconomySimulationState,
  deltaSec: number,
  _config: SimulationConfig
): EconomySimulationState {
  const workers = { ...state.workers };

  for (const [id, worker] of Object.entries(workers)) {
    if (worker.type === "burdenThrall") continue;

    const building = worker.currentBuildingId
      ? state.buildings[worker.currentBuildingId]
      : undefined;

    if (!building) {
      workers[id] = { ...worker, isIdle: true };
      continue;
    }

    if (isWorkerAtBuilding(worker.position, building.position)) {
      workers[id] = { ...worker, position: { x: building.position.x, y: building.position.y }, path: [], isIdle: false };
      continue;
    }

    let path = worker.path && worker.path.length > 0 ? worker.path : undefined;

    if (!path) {
      const result = findPath(worker.position, building.position, state);
      path = result.isComplete && result.points.length > 0 ? result.points : undefined;
    }

    if (!path || path.length === 0) {
      // No path from A* — move directly toward building (open terrain)
      const dx = building.position.x - worker.position.x;
      const dy = building.position.y - worker.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = MOVE_SPEED * deltaSec;
      let pos: { x: number; y: number };
      if (step >= dist) {
        pos = { x: building.position.x, y: building.position.y };
      } else {
        pos = {
          x: worker.position.x + (dx / dist) * step,
          y: worker.position.y + (dy / dist) * step,
        };
      }
      const arrived = isWorkerAtBuilding(pos, building.position);
      workers[id] = { ...worker, position: pos, isIdle: false, path: arrived ? [] : worker.path };
      continue;
    }

    let remaining = MOVE_SPEED * deltaSec;
    let pos = { ...worker.position };
    let pathCopy = [...path];

    while (remaining > 0 && pathCopy.length > 0) {
      const target = pathCopy[0];
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= remaining) {
        pos = { x: target.x, y: target.y };
        remaining -= dist;
        pathCopy.shift();
      } else {
        pos = {
          x: pos.x + (dx / dist) * remaining,
          y: pos.y + (dy / dist) * remaining,
        };
        remaining = 0;
      }
    }

    const arrived = isWorkerAtBuilding(pos, building.position);
    workers[id] = {
      ...worker,
      position: arrived ? { x: building.position.x, y: building.position.y } : pos,
      path: arrived ? [] : pathCopy,
      isIdle: false,
    };
  }

  return { ...state, workers };
}
