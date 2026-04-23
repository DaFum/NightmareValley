import { EconomySimulationState } from "../../core/economy.simulation";
import { SimulationConfig } from "../../economy/balancing.constants";
import { findPathAStar } from "../../pathing/path.a-star";
import { createGridFromTerritory } from "../../pathing/path.grid";

export function updateWorkersAI(
  state: EconomySimulationState,
  deltaSec: number,
  config: SimulationConfig
): EconomySimulationState {

  const moveSpeed = 1.0; // grid tiles per second

  for (const worker of Object.values(state.workers)) {
    // If worker has no active destination, give it a random one nearby to prove pathing
    if (!worker.path || worker.path.length === 0) {
       // For MVP, just clamp random targets within 0..9 grid of the map
       const targetX = Math.max(0, Math.min(9, Math.round(worker.position.x + (Math.random() * 4 - 2))));
       const targetY = Math.max(0, Math.min(9, Math.round(worker.position.y + (Math.random() * 4 - 2))));

       // Calculate an actual path using A*
       const grid = createGridFromTerritory(state.territory, 10, 10);
       const pathResult = findPathAStar(grid, worker.position, {x: targetX, y: targetY});

       if (pathResult.points.length > 0) {
         worker.path = pathResult.points;
         worker.isIdle = false;
       }
    }

    if (worker.path && worker.path.length > 0) {
      const target = worker.path[0];
      const dx = target.x - worker.position.x;
      const dy = target.y - worker.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.1) {
        // Reached waypoint
        worker.position.x = target.x;
        worker.position.y = target.y;
        worker.path.shift();
        if (worker.path.length === 0) {
          worker.isIdle = true;
        }
      } else {
        // Move towards waypoint
        const step = moveSpeed * deltaSec;
        if (step >= dist) {
          worker.position.x = target.x;
          worker.position.y = target.y;
          worker.path.shift();
        } else {
          worker.position.x += (dx / dist) * step;
          worker.position.y += (dy / dist) * step;
        }
      }
    }
  }

  return state;
}
