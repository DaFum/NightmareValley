import { create } from 'zustand';
import {
  EconomySimulationState,
  simulateTick,
  placeBuilding,
  upgradeBuilding,
  connectBuildingToRoad,
} from '../game/core/economy.simulation';
import { DEFAULT_SIMULATION_CONFIG } from '../game/economy/balancing.constants';
import { BuildingType, ResourceInventory, WorkerType } from "../game/core/economy.types";
import { BuildingInstance, Position, WorkerInstance } from "../game/core/game.types";
import { loadInitialMap } from "../game/map/map.loader";
import { RoadNode } from "../game/economy/transport.logic";

export interface GameStore {
  gameState: EconomySimulationState;
  isRunning: boolean;
  tickRate: number;
  lastError?: Error | string | unknown;
  setGameState: (state: EconomySimulationState) => void;
  togglePlayPause: () => void;
  setTickRate: (rate: number) => void;
  advanceTick: (deltaSec: number) => void;
  placeBuildingAt: (ownerId: string, buildingType: BuildingType, tileId: string) => void;
  upgradeBuildingAt: (ownerId: string, buildingId: string) => void;
  connectBuildingAt: (buildingId: string) => void;
  toggleBuildingActive: (buildingId: string) => void;
}


import { createId } from '../game/core/economy.simulation';

const player1Id = createId('player');
const organHarvesterId = createId('bld');
const plankMillId = createId('bld');
const quarryId = createId('bld');
const fieldId = createId('bld');
const wellId = createId('bld');
const dustMillId = createId('bld');
const ovenId = createId('bld');
const vaultId = createId('bld');
const timberWorkerId = createId('wrk');
const sawyerId = createId('wrk');
const quarryWorkerId = createId('wrk');
const farmerId = createId('wrk');
const wellWorkerId = createId('wrk');
const millerId = createId('wrk');
const acolyteId = createId('wrk');
const vaultWorkerId = createId('wrk');
const carrier1Id = createId('wrk');
const carrier2Id = createId('wrk');
const carrier3Id = createId('wrk');

const initialTerritory = loadInitialMap();

function prepareInitialTerritory(ownerId: string) {
  const territory = initialTerritory;
  const ownedRadius = 13;
  const start = { x: 7, y: 7 };
  const ownedTileIds: string[] = [];

  for (const tile of Object.values(territory.tiles)) {
    const dx = tile.position.x - start.x;
    const dy = tile.position.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= ownedRadius) {
      tile.ownerId = ownerId;
      ownedTileIds.push(tile.id);
    }

    if (tile.terrain === 'weepingForest') {
      tile.resourceDeposit = { sinewTimber: 100 };
    } else if (tile.terrain === 'ribMountain' || tile.terrain === 'cathedralRock') {
      tile.resourceDeposit = {
        sepulcherStone: 80,
        veinIronOre: tile.position.x % 3 === 0 ? 30 : 0,
        graveCoal: tile.position.y % 4 === 0 ? 30 : 0,
      };
    } else if (tile.terrain === 'ashBog') {
      tile.resourceDeposit = { marrowGrain: 70 };
    } else if (tile.terrain === 'placentaLake') {
      tile.resourceDeposit = { amnioticWater: 100, eyelessFish: 40 };
    }
  }

  const markBuilding = (x: number, y: number, buildingId: string) => {
    const tileId = territory.tileIndex?.[`${x},${y}`] ?? `tile_${x}_${y}`;
    const tile = territory.tiles[tileId];
    if (tile) {
      tile.ownerId = ownerId;
      tile.buildingId = buildingId;
    }
  };

  const roadPositions = createStarterRoadPositions();
  for (let index = 0; index < roadPositions.length; index++) {
    const position = roadPositions[index];
    const tileId = territory.tileIndex?.[`${position.x},${position.y}`] ?? `tile_${position.x}_${position.y}`;
    const tile = territory.tiles[tileId];
    if (tile) {
      tile.ownerId = ownerId;
      tile.roadNodeId = `road_${position.x}_${position.y}`;
      if (!ownedTileIds.includes(tile.id)) ownedTileIds.push(tile.id);
    }
  }

  markBuilding(3, 9, organHarvesterId);
  markBuilding(6, 5, plankMillId);
  markBuilding(11, 5, quarryId);
  markBuilding(8, 10, fieldId);
  markBuilding(9, 10, wellId);
  markBuilding(7, 5, dustMillId);
  markBuilding(8, 5, ovenId);
  markBuilding(5, 5, vaultId);

  return { territory, ownedTileIds };
}

function createStarterRoadPositions(): Position[] {
  return [
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 7, y: 5 },
    { x: 8, y: 5 },
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 3, y: 7 },
    { x: 3, y: 8 },
    { x: 3, y: 9 },
    { x: 6, y: 6 },
    { x: 7, y: 6 },
    { x: 7, y: 7 },
    { x: 7, y: 8 },
    { x: 8, y: 9 },
    { x: 8, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 6 },
    { x: 9, y: 6 },
    { x: 10, y: 6 },
    { x: 11, y: 6 },
    { x: 11, y: 5 },
    { x: 12, y: 6 },
    { x: 12, y: 7 },
    { x: 12, y: 8 },
    { x: 12, y: 9 },
    { x: 13, y: 10 },
    { x: 13, y: 11 },
  ];
}

function createStarterRoadNodes(): Record<string, RoadNode> {
  const positions = createStarterRoadPositions();
  const nodes: Record<string, RoadNode> = {};

  for (const position of positions) {
    const id = `road_${position.x}_${position.y}`;
    const connectedNodeIds = positions
      .filter((other) => Math.abs(other.x - position.x) + Math.abs(other.y - position.y) === 1)
      .map((other) => `road_${other.x}_${other.y}`);
    nodes[id] = { id, position, connectedNodeIds };
  }

  return nodes;
}

function createStarterBuilding(
  id: string,
  type: BuildingType,
  position: Position,
  assignedWorkers: string[],
  buffers: {
    inputBuffer?: ResourceInventory;
    outputBuffer?: ResourceInventory;
    internalStorage?: ResourceInventory;
    currentRecipeId?: string;
  } = {}
): BuildingInstance {
  return {
    id,
    type,
    ownerId: player1Id,
    level: 1,
    integrity: 100,
    position,
    connectedToRoad: true,
    inputBuffer: buffers.inputBuffer ?? {},
    outputBuffer: buffers.outputBuffer ?? {},
    internalStorage: buffers.internalStorage ?? {},
    assignedWorkers,
    currentRecipeId: buffers.currentRecipeId,
    progressSec: 0,
    isActive: true,
    corruption: 0,
  };
}

function createStarterWorker(
  id: string,
  type: WorkerType,
  position: Position,
  homeBuildingId?: string,
  isIdle = false
): WorkerInstance {
  return {
    id,
    type,
    ownerId: player1Id,
    homeBuildingId,
    currentBuildingId: homeBuildingId,
    position,
    isIdle,
    morale: 100,
    infection: 0,
    scars: 0,
  };
}

const preparedInitialTerritory = prepareInitialTerritory(player1Id);

const initialGameState: EconomySimulationState = {
  tick: 0,
  ageOfTeeth: 0,
  players: {
    [player1Id]: {
      id: player1Id,
      name: "The First Ascendant",
      stock: { toothPlanks: 80, sepulcherStone: 55, marrowGrain: 20, amnioticWater: 20, boneDust: 0, funeralLoaf: 0 },
      buildings: [
        organHarvesterId,
        plankMillId,
        quarryId,
        fieldId,
        wellId,
        dustMillId,
        ovenId,
        vaultId,
      ],
      workers: [
        timberWorkerId,
        sawyerId,
        quarryWorkerId,
        farmerId,
        wellWorkerId,
        millerId,
        acolyteId,
        vaultWorkerId,
        carrier1Id,
        carrier2Id,
        carrier3Id,
      ],
      territoryTileIds: preparedInitialTerritory.ownedTileIds,
      populationLimit: 20,
      doctrine: "industry",
      dread: 0,
      holinessDebt: 0
    }
  },
  buildings: {
    [organHarvesterId]: createStarterBuilding(organHarvesterId, "organHarvester", { x: 3, y: 9 }, [timberWorkerId]),
    [plankMillId]: createStarterBuilding(plankMillId, "millOfGnashing", { x: 6, y: 5 }, [sawyerId], {
      currentRecipeId: "rendSinewTimber",
    }),
    [quarryId]: createStarterBuilding(quarryId, "sepulcherQuarry", { x: 11, y: 5 }, [quarryWorkerId]),
    [fieldId]: createStarterBuilding(fieldId, "fieldOfMouths", { x: 8, y: 10 }, [farmerId]),
    [wellId]: createStarterBuilding(wellId, "wombWell", { x: 9, y: 10 }, [wellWorkerId]),
    [dustMillId]: createStarterBuilding(dustMillId, "dustCathedralMill", { x: 7, y: 5 }, [millerId], {
      inputBuffer: { marrowGrain: 4 },
      currentRecipeId: "grindMarrowGrain",
    }),
    [ovenId]: createStarterBuilding(ovenId, "ovenOfLastBread", { x: 8, y: 5 }, [acolyteId], {
      inputBuffer: { amnioticWater: 4 },
      currentRecipeId: "bakeFuneralLoaf",
    }),
    [vaultId]: createStarterBuilding(vaultId, "vaultOfDigestiveStone", { x: 5, y: 5 }, [vaultWorkerId]),
  },
  workers: {
    [timberWorkerId]: createStarterWorker(timberWorkerId, "timberExecutioner", { x: 3, y: 9 }, organHarvesterId),
    [sawyerId]: createStarterWorker(sawyerId, "gnashSawyer", { x: 6, y: 5 }, plankMillId),
    [quarryWorkerId]: createStarterWorker(quarryWorkerId, "graveToothBreaker", { x: 11, y: 5 }, quarryId),
    [farmerId]: createStarterWorker(farmerId, "mouthFarmer", { x: 8, y: 10 }, fieldId),
    [wellWorkerId]: createStarterWorker(wellWorkerId, "wellSupplicant", { x: 9, y: 10 }, wellId),
    [millerId]: createStarterWorker(millerId, "dustMiller", { x: 7, y: 5 }, dustMillId),
    [acolyteId]: createStarterWorker(acolyteId, "ovenAcolyte", { x: 8, y: 5 }, ovenId),
    [vaultWorkerId]: createStarterWorker(vaultWorkerId, "burdenThrall", { x: 5, y: 5 }, vaultId),
    [carrier1Id]: createStarterWorker(carrier1Id, "burdenThrall", { x: 5, y: 6 }, undefined, true),
    [carrier2Id]: createStarterWorker(carrier2Id, "burdenThrall", { x: 6, y: 6 }, undefined, true),
    [carrier3Id]: createStarterWorker(carrier3Id, "burdenThrall", { x: 7, y: 6 }, undefined, true),
  },
  territory: preparedInitialTerritory.territory,
  transport: {
    roadNodes: createStarterRoadNodes(),
    jobs: {},
    activeCarrierTasks: {},
    networkStress: 0,
    averageLatencySec: 0,
  },
  worldPulse: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: initialGameState,
  isRunning: false,
  tickRate: 1,
  lastError: undefined,

  setGameState: (state) => set({ gameState: state }),
  togglePlayPause: () => set((state) => ({ isRunning: !state.isRunning })),
  setTickRate: (rate) => {
    let clampedRate = 1;
    if (Number.isFinite(rate) && rate > 0) {
      clampedRate = Math.max(1e-6, Math.min(1000, rate));
    }
    set({ tickRate: clampedRate });
  },

  advanceTick: (deltaSec) => {
    if (deltaSec <= 0) return;

    const { gameState, isRunning, tickRate } = get();
    if (!isRunning) return;

    try {
      const nextState = simulateTick(gameState, deltaSec * tickRate, DEFAULT_SIMULATION_CONFIG);
      set({ gameState: nextState });
    } catch (error) {
      console.error("Simulation tick failed:", error);
      set({ isRunning: false, lastError: error });
    }
  },

  placeBuildingAt: (ownerId, buildingType, tileId) => {
    try {
      const { gameState } = get();
      const nextState = placeBuilding(gameState, ownerId, buildingType, tileId);
      set({ gameState: nextState });
    } catch (error) {
      console.error("Failed to place building:", error);
      set({ lastError: error });
    }
  },

  upgradeBuildingAt: (ownerId, buildingId) => {
    try {
      const { gameState } = get();
      const nextState = upgradeBuilding(gameState, ownerId, buildingId);
      set({ gameState: nextState });
    } catch (error) {
      console.error("Failed to upgrade building:", error);
      set({ lastError: error });
    }
  },

  connectBuildingAt: (buildingId) => {
    try {
      const { gameState } = get();
      const nextState = connectBuildingToRoad(gameState, buildingId);
      set({ gameState: nextState });
    } catch (error) {
      console.error("Failed to connect building:", error);
      set({ lastError: error });
    }
  },

  toggleBuildingActive: (buildingId) => {
    const { gameState } = get();
    const building = gameState.buildings[buildingId];
    if (!building) return;
    const nextState = {
      ...gameState,
      buildings: {
        ...gameState.buildings,
        [buildingId]: {
          ...building,
          isActive: !building.isActive,
        },
      },
    };
    set({ gameState: nextState });
  },
}));
