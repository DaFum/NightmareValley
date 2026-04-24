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
  dispatchDebugJobsFromHQ: (count: number, resourceType: import("../game/core/economy.types").ResourceType) => void;
  resetFootfall: () => void;
}


import { createId } from '../game/core/economy.simulation';

const player1Id = createId('player');
const vaultId = createId('bld');
const carrier1Id = createId('wrk');
const carrier2Id = createId('wrk');
const carrier3Id = createId('wrk');

const initialTerritory = loadInitialMap();

function prepareInitialTerritory(ownerId: string) {
  const territory = JSON.parse(JSON.stringify(initialTerritory)) as typeof initialTerritory;
  const ownedRadius = 13;
  const start = { x: 7, y: 7 };
  const ownedTileIds: string[] = [];

  for (const tile of Object.values(territory.tiles)) {
    tile.footfall = 0;
    tile.tier = "grass";

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

  markBuilding(7, 7, vaultId);

  return { territory, ownedTileIds };
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
        vaultId,
      ],
      workers: [
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
    [vaultId]: createStarterBuilding(vaultId, "vaultOfDigestiveStone", { x: 7, y: 7 }, [], {
      internalStorage: { sinewTimber: 100 },
      outputBuffer: { sinewTimber: 100 }
    }),
  },
  workers: {
    [carrier1Id]: createStarterWorker(carrier1Id, "burdenThrall", { x: 7, y: 8 }, undefined, true),
    [carrier2Id]: createStarterWorker(carrier2Id, "burdenThrall", { x: 8, y: 8 }, undefined, true),
    [carrier3Id]: createStarterWorker(carrier3Id, "burdenThrall", { x: 8, y: 7 }, undefined, true),
  },
  territory: preparedInitialTerritory.territory,
  transport: {
    jobs: {},
    activeCarrierTasks: {},
    networkStress: 0,
    averageLatencySec: 0,
    queuedJobCount: 0,
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

  dispatchDebugJobsFromHQ: (count, resourceType) => {
    set((state) => {
      const gs = state.gameState;
      const hq = Object.values(gs.buildings).find(b => b.ownerId === player1Id && b.type === "vaultOfDigestiveStone");
      if (!hq) return state;

      const otherVaults = Object.values(gs.buildings).filter(b => b.id !== hq.id && b.type === "vaultOfDigestiveStone");
      if (otherVaults.length === 0) {
        console.warn("No second warehouse found for debug jobs.");
        return state;
      }

      let nearest: BuildingInstance | null = null;
      let minDist = Infinity;
      for (const v of otherVaults) {
        const dx = v.position.x - hq.position.x;
        const dy = v.position.y - hq.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          nearest = v;
        }
      }

      if (!nearest) return state;

      const newJobs = { ...gs.transport.jobs };
      for (let i = 0; i < count; i++) {
        const jobId = createId('job');
        newJobs[jobId] = {
          id: jobId,
          fromBuildingId: hq.id,
          toBuildingId: nearest.id,
          resourceType,
          amount: 1,
          priority: DEFAULT_SIMULATION_CONFIG.defaultTransportPriority + 100,
          reserved: 0,
          delivered: 0,
          status: "queued"
        };
      }

      return {
        gameState: {
          ...gs,
          transport: {
            ...gs.transport,
            jobs: newJobs,
            queuedJobCount: (gs.transport.queuedJobCount || 0) + count
          }
        }
      };
    });
  },

  resetFootfall: () => {
    set((state) => {
      const gs = state.gameState;
      const tiles = { ...gs.territory.tiles };
      for (const tileId in tiles) {
        tiles[tileId] = {
          ...tiles[tileId],
          footfall: 0,
          tier: "grass"
        };
      }
      return {
        gameState: {
          ...gs,
          territory: {
            ...gs.territory,
            tiles
          }
        }
      };
    });
  }
}));
