import { create } from 'zustand';
import { EconomySimulationState, simulateTick } from '../game/core/economy.simulation';
import { DEFAULT_SIMULATION_CONFIG } from '../game/economy/balancing.constants';
import { loadInitialMap } from '../game/map/map.loader';

export interface GameStore {
  gameState: EconomySimulationState;
  isRunning: boolean;
  tickRate: number;
  lastError?: Error | string | unknown;
  setGameState: (state: EconomySimulationState) => void;
  togglePlayPause: () => void;
  setTickRate: (rate: number) => void;
  advanceTick: (deltaSec: number) => void;
}

const initialGameState: EconomySimulationState = {
  tick: 0,
  ageOfTeeth: 0,
  players: {
    "player_1": {
      id: "player_1",
      name: "Player 1",
      stock: {
        toothPlanks: 666,
        marrowGrain: 42,
        amnioticWater: 13,
      },
      buildings: ["building_1"],
      workers: ["worker_1"],
      territoryTileIds: ["tile_1"],
      populationLimit: 20,
      doctrine: "industry",
      dread: 0,
      holinessDebt: 0
    }
  },
  buildings: {
    "building_1": {
      id: "building_1",
      type: "organHarvester",
      ownerId: "player_1",
      level: 1,
      integrity: 100,
      position: { x: 0, y: 0 },
      connectedToRoad: true,
      inputBuffer: {},
      outputBuffer: {},
      internalStorage: {},
      assignedWorkers: ["worker_1"],
      progressSec: 0,
      isActive: true,
      corruption: 0,
      constructionProgress: 100,
    }
  },
  workers: {
    "worker_1": {
      id: "worker_1",
      type: "timberExecutioner",
      ownerId: "player_1",
      homeBuildingId: "building_1",
      currentBuildingId: "building_1",
      position: { x: 4, y: 4 }, // Start roughly in middle of 10x10 map
      isIdle: true,
      morale: 100,
      infection: 0,
      scars: 0,
    }
  },
  territory: loadInitialMap(),
  transport: {
    roadNodes: {},
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
}));
