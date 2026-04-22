import { EconomySimulationState } from "../core/economy.simulation";
import { TileId } from "../core/entity.ids";
import { MapTile, PlayerState, BuildingInstance, WorkerInstance } from "../core/game.types";
import { TerrainType } from "../core/economy.types";
import { createId } from "../core/economy.simulation";

export function generateInitialWorld(): EconomySimulationState {
  const tiles: Record<TileId, MapTile> = {};

  // Generate a small 10x10 map for testing
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const id = `tile_${x}_${y}`;
      let terrain: TerrainType = "scarredEarth";
      if (Math.random() < 0.2) {
        terrain = "bloodWater";
      } else if (Math.random() < 0.3) {
        terrain = "weepingForest";
      }

      tiles[id] = {
        id,
        position: { x, y },
        terrain,
      };
    }
  }

  const playerId = "player_1";
  const player: PlayerState = {
    id: playerId,
    name: "The Architect",
    stock: {
      toothPlanks: 100,
      sepulcherStone: 50,
      marrowGrain: 200,
      amnioticWater: 100,
    },
    buildings: [],
    workers: [],
    territoryTileIds: Object.keys(tiles),
    populationLimit: 20,
    doctrine: "consumption",
    dread: 0,
    holinessDebt: 0,
  };

  const buildings: Record<string, BuildingInstance> = {};
  const workers: Record<string, WorkerInstance> = {};

  // Add a building
  const buildingId = createId("building");
  buildings[buildingId] = {
      id: buildingId,
      type: "organHarvester",
      ownerId: playerId,
      level: 1,
      integrity: 100,
      position: { x: 4, y: 4 },
      connectedToRoad: false,
      inputBuffer: {},
      outputBuffer: {},
      internalStorage: {},
      assignedWorkers: [],
      progressSec: 0,
      isActive: true,
      constructionProgress: 1,
  };
  player.buildings.push(buildingId);
  tiles[`tile_4_4`].buildingId = buildingId;

  // Add a worker
  const workerId = createId("worker");
  workers[workerId] = {
      id: workerId,
      type: "timberExecutioner",
      ownerId: playerId,
      position: { x: 5, y: 5 },
      isIdle: true,
      morale: 100,
      infection: 0,
      scars: 0
  };
  player.workers.push(workerId);

  return {
    tick: 0,
    ageOfTeeth: 0,
    players: {
      [playerId]: player,
    },
    buildings,
    workers,
    territory: { tiles },
    transport: {
      roadNodes: {},
      jobs: {},
      activeCarrierTasks: {},
      networkStress: 0,
      averageLatencySec: 0,
    },
    worldPulse: 0,
  };
}
