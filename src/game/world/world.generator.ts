import { EconomySimulationState } from "../core/economy.simulation";
import { TileId } from "../core/entity.ids";
import { MapTile, PlayerState, BuildingInstance, WorkerInstance } from "../core/game.types";
import { TerrainType } from "../core/economy.types";
import { generateProceduralTiledMap } from "../map/procedural";
import { createId } from "../core/economy.simulation";

export function generateInitialWorld(): EconomySimulationState {
  const tiles: Record<TileId, MapTile> = {};

  // Generate a procedurally coherent map using the generator
  const mapWidth = 48;
  const mapHeight = 48;
  const tiled = generateProceduralTiledMap({ width: mapWidth, height: mapHeight });

  // We expect the first tileset to enumerate terrain types via the 'type' property
  const ts = tiled.tilesets && tiled.tilesets[0];
  const gidToTerrain: Record<number, TerrainType> = {};
  if (ts && ts.tiles) {
    for (const t of ts.tiles) {
      const gid = (ts.firstgid || 1) + (t.id || 0);
      const prop = t.properties?.find(p => p.name === 'type');
      if (prop && typeof prop.value === 'string') {
        gidToTerrain[gid] = prop.value as TerrainType;
      }
    }
  }

  const terrainLayer = tiled.layers.find(l => l.name === 'Terrain' && l.type === 'tilelayer');
  if (terrainLayer && terrainLayer.data && terrainLayer.width && terrainLayer.height) {
    for (let y = 0; y < terrainLayer.height; y++) {
      for (let x = 0; x < terrainLayer.width; x++) {
        const index = y * terrainLayer.width + x;
        const gid = terrainLayer.data[index] || 0;
        const terrain = gidToTerrain[gid] || 'scarredEarth';
        const id = `tile_${x}_${y}`;
        tiles[id] = { id, position: { x, y }, terrain, footfall: 0, tier: "grass" };
      }
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

  // Scenario: Dust Cathedral Mill producing Bone Dust
  const millId = createId("building");
  buildings[millId] = {
      id: millId,
      type: "dustCathedralMill",
      ownerId: playerId,
      level: 1,
      integrity: 100,
      position: { x: 10, y: 10 },
      connectedToRoad: true,
      inputBuffer: { marrowGrain: 100 }, // Pre-filled to start working
      outputBuffer: {},
      internalStorage: {},
      assignedWorkers: [], // Will need a dustMiller
      progressSec: 0,
      isActive: true,
      constructionProgress: 1,
      currentRecipeId: "grindMarrowGrain"
  };
  player.buildings.push(millId);
  tiles[`tile_10_10`].buildingId = millId;
  tiles[`tile_10_10`].terrain = "scarredEarth"; // Ensure terrain is valid for buildings

  const dustMillerId = createId("worker");
  workers[dustMillerId] = {
      id: dustMillerId,
      type: "dustMiller",
      ownerId: playerId,
      homeBuildingId: millId,
      currentBuildingId: millId,
      position: { x: 10, y: 10 },
      isIdle: false,
      morale: 100,
      infection: 0,
      scars: 0
  };
  buildings[millId].assignedWorkers.push(dustMillerId);
  player.workers.push(dustMillerId);

  // Scenario: Oven of Last Bread consuming Bone Dust
  const bakeryId = createId("building");
  buildings[bakeryId] = {
      id: bakeryId,
      type: "ovenOfLastBread",
      ownerId: playerId,
      level: 1,
      integrity: 100,
      position: { x: 14, y: 10 },
      connectedToRoad: true,
      inputBuffer: { amnioticWater: 100 }, // Needs boneDust from the Mill
      outputBuffer: {},
      internalStorage: {},
      assignedWorkers: [], // Will need an ovenAcolyte
      progressSec: 0,
      isActive: true,
      constructionProgress: 1,
      currentRecipeId: "bakeFuneralLoaf"
  };
  player.buildings.push(bakeryId);
  tiles[`tile_14_10`].buildingId = bakeryId;
  tiles[`tile_14_10`].terrain = "scarredEarth"; // Ensure terrain is valid for buildings

  const acolyteId = createId("worker");
  workers[acolyteId] = {
      id: acolyteId,
      type: "ovenAcolyte",
      ownerId: playerId,
      homeBuildingId: bakeryId,
      currentBuildingId: bakeryId,
      position: { x: 14, y: 10 },
      isIdle: false,
      morale: 100,
      infection: 0,
      scars: 0
  };
  buildings[bakeryId].assignedWorkers.push(acolyteId);
  player.workers.push(acolyteId);

  // Carrier to transport goods between them
  const carrierId = createId("worker");
  workers[carrierId] = {
      id: carrierId,
      type: "burdenThrall",
      ownerId: playerId,
      position: { x: 12, y: 10 },
      isIdle: true,
      morale: 100,
      infection: 0,
      scars: 0
  };
  player.workers.push(carrierId);

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
      jobs: {},
      activeCarrierTasks: {},
      networkStress: 0,
      averageLatencySec: 0,
      queuedJobCount: 0,
    },
    worldPulse: 0,
  };
}
