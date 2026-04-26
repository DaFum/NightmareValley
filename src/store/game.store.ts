import { create } from 'zustand';
import {
  EconomySimulationState,
  placeBuilding,
  upgradeBuilding,
  connectBuildingToRoad,
  spawnWorker,
  assignWorkerToBuilding,
} from '../game/core/economy.simulation';
import { DEFAULT_SIMULATION_CONFIG } from '../game/economy/balancing.constants';
import { tickWorld } from '../game/world/world.tick';
import { WorldState } from '../game/world/world.types';
import { BuildingType, ResourceInventory, WorkerType } from "../game/core/economy.types";
import { BuildingInstance, Position, WorkerInstance } from "../game/core/game.types";
import { loadInitialMap } from "../game/map/map.loader";
import { createTransportJob, buildingAcceptsResource } from "../game/economy/transport.logic";
import { deepClone } from "../lib/deep-clone";
import {
  clampTickRate,
  runSimulationSteps as runBoundedSimulationSteps,
  SimulationStepProfile,
} from './game-simulation.utils';
import { RuntimeIssue, toRuntimeIssue } from './runtime-issue';

export type GameScenarioProfile = 'sandbox' | 'challenging' | 'hardcore';

export type DebugCommand =
  | { type: 'dispatch-jobs'; count: number; resourceType: import("../game/core/economy.types").ResourceType }
  | { type: 'reset-footfall' }
  | { type: 'set-tick-rate'; value: number };

export interface GameStore {
  gameState: WorldState;
  isRunning: boolean;
  tickRate: number;
  lastError?: RuntimeIssue;
  activeScenario: GameScenarioProfile;
  setGameState: (state: WorldState) => void;
  setRunning: (running: boolean) => void;
  togglePlayPause: () => void;
  setTickRate: (rate: number) => void;
  setScenarioProfile: (profile: GameScenarioProfile) => void;
  advanceTick: (deltaSec: number) => void;
  runSimulationSteps: (
    deltaSec: number,
    fixedStepSec: number,
    maxSteps: number,
    profile?: SimulationStepProfile[]
  ) => { stepsProcessed: number; carryoverSec: number; droppedFrameDebt: boolean };
  placeBuildingAt: (ownerId: string, buildingType: BuildingType, tileId: string) => void;
  upgradeBuildingAt: (ownerId: string, buildingId: string) => void;
  connectBuildingAt: (buildingId: string) => void;
  toggleBuildingActive: (buildingId: string) => void;
  runDebugCommand: (command: DebugCommand) => void;
  dispatchDebugJobsFromHQ: (count: number, resourceType: import("../game/core/economy.types").ResourceType) => void;
  resetFootfall: () => void;
  spawnAndAssignWorker: (ownerId: string, workerType: WorkerType, buildingId: string) => void;
  setDeliveryPriority: (buildingId: string, priority: number) => void;
  togglePausedInput: (buildingId: string, resourceType: import("../game/core/economy.types").ResourceType) => void;
}


import { createId } from '../game/core/economy.simulation';

const player1Id = createId('player');
const vaultId = createId('bld');
const harvesterId = createId('bld');
const millId = createId('bld');
const carrier1Id = createId('wrk');
const carrier2Id = createId('wrk');
const carrier3Id = createId('wrk');
const carrier4Id = createId('wrk');
const carrier5Id = createId('wrk');
const timberExecId = createId('wrk');
const gnashSawyerId = createId('wrk');

const initialTerritory = loadInitialMap();

function prepareInitialTerritory(ownerId: string) {
  const territory = deepClone(initialTerritory);
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
  markBuilding(5, 7, harvesterId);
  markBuilding(9, 7, millId);

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

function scenarioStock(profile: GameScenarioProfile): ResourceInventory {
  switch (profile) {
    case 'sandbox':
      return { toothPlanks: 160, sepulcherStone: 120, marrowGrain: 80, amnioticWater: 80, boneDust: 20, funeralLoaf: 30 };
    case 'hardcore':
      return { toothPlanks: 45, sepulcherStone: 30, marrowGrain: 12, amnioticWater: 12, boneDust: 0, funeralLoaf: 0 };
    case 'challenging':
    default:
      return { toothPlanks: 80, sepulcherStone: 55, marrowGrain: 20, amnioticWater: 20, boneDust: 0, funeralLoaf: 0 };
  }
}

const initialGameState: WorldState = {
  tick: 0,
  ageOfTeeth: 0,
  seed: 1,
  lastDeltaSec: 0,
  scenarioProfile: 'challenging',
  players: {
    [player1Id]: {
      id: player1Id,
      name: "The First Ascendant",
      stock: { ...scenarioStock('challenging'), sinewTimber: 100 },
      buildings: [
        vaultId,
        harvesterId,
        millId,
      ],
      workers: [
        carrier1Id,
        carrier2Id,
        carrier3Id,
        carrier4Id,
        carrier5Id,
        timberExecId,
        gnashSawyerId,
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
      outputBuffer: { ...scenarioStock('challenging'), sinewTimber: 100 },
      internalStorage: {},
    }),
    [harvesterId]: createStarterBuilding(harvesterId, "organHarvester", { x: 5, y: 7 }, [timberExecId], {
      outputBuffer: {},
    }),
    [millId]: createStarterBuilding(millId, "millOfGnashing", { x: 9, y: 7 }, [gnashSawyerId], {
      inputBuffer: { sinewTimber: 5 },
      outputBuffer: { toothPlanks: 3 },
      currentRecipeId: "rendSinewTimber",
    }),
  },
  workers: {
    [carrier1Id]: createStarterWorker(carrier1Id, "burdenThrall", { x: 7, y: 8 }, undefined, true),
    [carrier2Id]: createStarterWorker(carrier2Id, "burdenThrall", { x: 8, y: 8 }, undefined, true),
    [carrier3Id]: createStarterWorker(carrier3Id, "burdenThrall", { x: 8, y: 7 }, undefined, true),
    [carrier4Id]: createStarterWorker(carrier4Id, "burdenThrall", { x: 6, y: 8 }, undefined, true),
    [carrier5Id]: createStarterWorker(carrier5Id, "burdenThrall", { x: 7, y: 6 }, undefined, true),
    [timberExecId]: createStarterWorker(timberExecId, "timberExecutioner", { x: 5, y: 7 }, harvesterId, false),
    [gnashSawyerId]: createStarterWorker(gnashSawyerId, "gnashSawyer", { x: 9, y: 7 }, millId, false),
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

function withScenarioProfile(state: WorldState, profile: GameScenarioProfile): WorldState {
  const player = state.players[player1Id];
  if (!player) return state;
  const vaultId = player.buildings.find(
    (id) => state.buildings[id]?.type === "vaultOfDigestiveStone"
  );
  const vault = vaultId ? state.buildings[vaultId] : undefined;
  const newStock = { ...scenarioStock(profile), sinewTimber: 100 };
  return {
    ...state,
    scenarioProfile: profile,
    players: {
      ...state.players,
      [player1Id]: { ...player, stock: newStock },
    },
    buildings: vault
      ? { ...state.buildings, [vault.id]: { ...vault, outputBuffer: newStock } }
      : state.buildings,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: initialGameState,
  isRunning: false,
  tickRate: 1,
  lastError: undefined,
  activeScenario: 'challenging',

  setGameState: (state) => set({ gameState: state }),
  setRunning: (running) => set({ isRunning: running }),
  togglePlayPause: () => set((state) => ({ isRunning: !state.isRunning })),
  setTickRate: (rate) => {
    set({ tickRate: clampTickRate(rate) });
  },
  setScenarioProfile: (profile) => {
    set((state) => ({
      activeScenario: profile,
      gameState: withScenarioProfile(state.gameState, profile),
    }));
  },

  advanceTick: (deltaSec) => {
    if (deltaSec <= 0) return;

    const { gameState, isRunning, tickRate } = get();
    if (!isRunning) return;

    try {
      const nextState = tickWorld(gameState, deltaSec * tickRate, DEFAULT_SIMULATION_CONFIG);
      set({ gameState: nextState });
    } catch (error) {
      console.error("Simulation tick failed:", error);
      set({ isRunning: false, lastError: toRuntimeIssue(error, 'SIM_TICK_FAILURE', 'advanceTick', gameState.tick) });
    }
  },

  runSimulationSteps: (deltaSec, fixedStepSec, maxSteps, profile) => {
    if (deltaSec <= 0 || fixedStepSec <= 0 || maxSteps <= 0) {
      return { stepsProcessed: 0, carryoverSec: 0, droppedFrameDebt: false };
    }

    const { gameState, isRunning, tickRate } = get();
    if (!isRunning) {
      return { stepsProcessed: 0, carryoverSec: 0, droppedFrameDebt: false };
    }

    try {
      const {
        nextState,
        stepsProcessed,
        carryoverSec,
        droppedFrameDebt,
      } = runBoundedSimulationSteps(gameState, deltaSec, tickRate, fixedStepSec, maxSteps, {
        profile,
      });
      set({ gameState: nextState });
      return { stepsProcessed, carryoverSec, droppedFrameDebt };
    } catch (error) {
      console.error("Simulation frame failed:", error);
      set({ isRunning: false, lastError: toRuntimeIssue(error, 'SIM_FRAME_FAILURE', 'runSimulationSteps', gameState.tick) });
      return { stepsProcessed: 0, carryoverSec: 0, droppedFrameDebt: true };
    }
  },

  placeBuildingAt: (ownerId, buildingType, tileId) => {
    try {
      const { gameState } = get();
      const nextState = placeBuilding(gameState, ownerId, buildingType, tileId);
      set({ gameState: { ...gameState, ...nextState } });
    } catch (error) {
      console.error("Failed to place building:", error);
      set({ lastError: toRuntimeIssue(error, 'BUILD_PLACE_FAILURE', 'placeBuildingAt', get().gameState.tick) });
    }
  },

  upgradeBuildingAt: (ownerId, buildingId) => {
    try {
      const { gameState } = get();
      const nextState = upgradeBuilding(gameState, ownerId, buildingId);
      set({ gameState: { ...gameState, ...nextState } });
    } catch (error) {
      console.error("Failed to upgrade building:", error);
      set({ lastError: toRuntimeIssue(error, 'BUILD_UPGRADE_FAILURE', 'upgradeBuildingAt', get().gameState.tick) });
    }
  },

  connectBuildingAt: (buildingId) => {
    try {
      const { gameState } = get();
      const nextState = connectBuildingToRoad(gameState, buildingId);
      set({ gameState: { ...gameState, ...nextState } });
    } catch (error) {
      console.error("Failed to connect building:", error);
      set({ lastError: toRuntimeIssue(error, 'BUILD_CONNECT_FAILURE', 'connectBuildingAt', get().gameState.tick) });
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

  runDebugCommand: (command) => {
    switch (command.type) {
      case 'dispatch-jobs':
        get().dispatchDebugJobsFromHQ(command.count, command.resourceType);
        break;
      case 'reset-footfall':
        get().resetFootfall();
        break;
      case 'set-tick-rate':
        get().setTickRate(command.value);
        break;
      default:
        break;
    }
  },

  dispatchDebugJobsFromHQ: (count, resourceType) => {
    if (count <= 0) return;
    set((state) => {
      const gs = state.gameState;
      const hq = Object.values(gs.buildings).find(b => b.ownerId === player1Id && b.type === "vaultOfDigestiveStone");
      if (!hq) return state;

      // Find nearest compatible target building (any building that accepts the resource)
      const candidates = Object.values(gs.buildings).filter(
        b => b.id !== hq.id && buildingAcceptsResource(b, resourceType)
      );

      let nearest: BuildingInstance | null = null;
      let minDist = Infinity;
      for (const v of candidates) {
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
        newJobs[jobId] = createTransportJob(
          jobId,
          hq.id,
          nearest.id,
          resourceType,
          1,
          DEFAULT_SIMULATION_CONFIG.defaultTransportPriority + 100
        );
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
  },

  spawnAndAssignWorker: (ownerId, workerType, buildingId) => {
    try {
      const { gameState } = get();
      const building = gameState.buildings[buildingId];
      if (!building) throw new Error(`Unknown building: ${buildingId}`);
      const spawnPos = { x: building.position.x + 1, y: building.position.y };
      let nextState = spawnWorker(gameState, ownerId, workerType, spawnPos);
      const newWorkerId = Object.keys(nextState.workers).find(
        id => !gameState.workers[id]
      );
      if (newWorkerId) {
        nextState = assignWorkerToBuilding(nextState, newWorkerId, buildingId);
      }
      set({ gameState: { ...gameState, ...nextState } });
    } catch (error) {
      console.error("Failed to spawn worker:", error);
      set({ lastError: toRuntimeIssue(error, 'WORKER_SPAWN_FAILURE', 'spawnAndAssignWorker', get().gameState.tick) });
    }
  },

  setDeliveryPriority: (buildingId, priority) => {
    const { gameState } = get();
    const building = gameState.buildings[buildingId];
    if (!building) return;
    set({
      gameState: {
        ...gameState,
        buildings: {
          ...gameState.buildings,
          [buildingId]: { ...building, deliveryPriority: Math.max(1, Math.min(5, priority)) },
        },
      },
    });
  },

  togglePausedInput: (buildingId, resourceType) => {
    const { gameState } = get();
    const building = gameState.buildings[buildingId];
    if (!building) return;
    const current = building.pausedInputs?.[resourceType] ?? false;
    set({
      gameState: {
        ...gameState,
        buildings: {
          ...gameState.buildings,
          [buildingId]: {
            ...building,
            pausedInputs: { ...building.pausedInputs, [resourceType]: !current },
          },
        },
      },
    });
  },
}));
