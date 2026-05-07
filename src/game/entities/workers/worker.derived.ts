const ARRIVAL_THRESHOLD = 0.5;

export function isWorkerAtBuilding(
  workerPos: { x: number; y: number },
  buildingPos: { x: number; y: number }
): boolean {
  const dx = workerPos.x - buildingPos.x;
  const dy = workerPos.y - buildingPos.y;
  return Math.sqrt(dx * dx + dy * dy) < ARRIVAL_THRESHOLD;
}
