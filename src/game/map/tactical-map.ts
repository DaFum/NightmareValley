import type { TerrainType } from '../core/economy.types';
import { getEconomyPlanSnapshot } from '../economy/economy.planner';
import type { WorldState } from '../world/world.types';

export type TacticalMapPointKind = 'building' | 'road' | 'worker';

export type TacticalMapTerrainPoint = {
  id: string;
  terrain: TerrainType;
  x: number;
  y: number;
  owned: boolean;
  hasRoad: boolean;
};

export type TacticalMapPoint = {
  id: string;
  kind: TacticalMapPointKind;
  x: number;
  y: number;
  active?: boolean;
};

export type TacticalMapSummary = {
  terrain: TacticalMapTerrainPoint[];
  points: TacticalMapPoint[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  counts: {
    ownedTiles: number;
    buildings: number;
    roads: number;
    workers: number;
    activeCarriers: number;
  };
};

export type TacticalMapBrief = {
  nextLabel: string;
  nextReason: string;
  markerCopy: string;
};

const EMPTY_BOUNDS = { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 1, height: 1 };

export function createTacticalMapSummary(state: WorldState, ownerId: string): TacticalMapSummary {
  const tiles = Object.values(state.territory.tiles);
  if (tiles.length === 0) {
    return {
      terrain: [],
      points: [],
      bounds: EMPTY_BOUNDS,
      counts: { ownedTiles: 0, buildings: 0, roads: 0, workers: 0, activeCarriers: 0 },
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let ownedTiles = 0;
  let roadCount = 0;

  const terrain: TacticalMapTerrainPoint[] = [];
  const points: TacticalMapPoint[] = [];

  for (const tile of tiles) {
    minX = Math.min(minX, tile.position.x);
    minY = Math.min(minY, tile.position.y);
    maxX = Math.max(maxX, tile.position.x);
    maxY = Math.max(maxY, tile.position.y);

    const owned = tile.ownerId === ownerId;
    const hasRoad = tile.terrain === 'scarPath' || tile.tier === 'cobble' || tile.tier === 'paved';
    if (owned) ownedTiles += 1;
    if (hasRoad) roadCount += 1;

    terrain.push({
      id: tile.id,
      terrain: tile.terrain,
      x: tile.position.x,
      y: tile.position.y,
      owned,
      hasRoad,
    });

    if (hasRoad) {
      points.push({ id: `road:${tile.id}`, kind: 'road', x: tile.position.x, y: tile.position.y });
    }
  }

  let buildingCount = 0;
  for (const building of Object.values(state.buildings)) {
    if (building.ownerId !== ownerId) continue;
    buildingCount += 1;
    points.push({
      id: building.id,
      kind: 'building',
      x: building.position.x,
      y: building.position.y,
      active: building.isActive,
    });
  }

  let workerCount = 0;
  let activeCarriers = 0;
  for (const worker of Object.values(state.workers)) {
    if (worker.ownerId !== ownerId) continue;
    workerCount += 1;
    if (worker.currentJob || worker.path?.length) activeCarriers += 1;
    points.push({
      id: worker.id,
      kind: 'worker',
      x: worker.position.x,
      y: worker.position.y,
      active: Boolean(worker.currentJob || worker.path?.length),
    });
  }

  const bounds = {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX + 1),
    height: Math.max(1, maxY - minY + 1),
  };

  return {
    terrain,
    points,
    bounds,
    counts: {
      ownedTiles,
      buildings: buildingCount,
      roads: roadCount,
      workers: workerCount,
      activeCarriers,
    },
  };
}

export function projectTacticalPoint(
  x: number,
  y: number,
  summary: Pick<TacticalMapSummary, 'bounds'>,
  width: number,
  height: number
) {
  const usableWidth = Math.max(1, width);
  const usableHeight = Math.max(1, height);
  return {
    x: ((x - summary.bounds.minX) / summary.bounds.width) * usableWidth,
    y: ((y - summary.bounds.minY) / summary.bounds.height) * usableHeight,
  };
}

export function createTacticalMapBrief(state: WorldState, ownerId: string): TacticalMapBrief {
  const summary = createTacticalMapSummary(state, ownerId);
  const plan = getEconomyPlanSnapshot(state, ownerId);
  return {
    nextLabel: plan.recommendation.label,
    nextReason: plan.recommendation.reason,
    markerCopy: `${summary.counts.buildings} buildings, ${summary.counts.roads} roads, ${summary.counts.activeCarriers} active carriers`,
  };
}
