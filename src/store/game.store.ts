import { create } from 'zustand';
import { EconomySimulationState, simulateTick, placeBuilding } from '../game/core/economy.simulation';
import { DEFAULT_SIMULATION_CONFIG } from '../game/economy/balancing.constants';
import { MapTile } from "../game/core/game.types";
import { BuildingType } from "../game/core/economy.types";
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
}


import { createId } from '../game/core/economy.simulation';

const player1Id = createId('player');
const millId = createId('bld');
const ovenId = createId('bld');
const millerId = createId('wrk');
const acolyteId = createId('wrk');
const carrier1Id = createId('wrk');
const carrier2Id = createId('wrk');

const initialTerritory = loadInitialMap();

const initialGameState: EconomySimulationState = {
  tick: 0,
  ageOfTeeth: 0,
  players: {
    [player1Id]: {
      id: player1Id,
      name: "The First Ascendant",
      stock: { toothPlanks: 666, marrowGrain: 100, amnioticWater: 100, boneDust: 0, funeralLoaf: 0 },
      buildings: [millId, ovenId],
      workers: [millerId, acolyteId, carrier1Id, carrier2Id],
      territoryTileIds: Object.keys(initialTerritory.tiles),
      populationLimit: 20,
      doctrine: "industry",
      dread: 0,
      holinessDebt: 0
    }
  },
  buildings: {
    [millId]: {
      id: millId,
      type: "dustCathedralMill",
      ownerId: player1Id,
      level: 1,
      integrity: 100,
      position: { x: 3, y: 3 },
      connectedToRoad: true,
      inputBuffer: { marrowGrain: 10 },
      outputBuffer: {},
      internalStorage: {},
      assignedWorkers: [millerId],
      currentRecipeId: "grindMarrowGrain",
      progressSec: 0,
      isActive: true
    },
    [ovenId]: {
      id: ovenId,
      type: "ovenOfLastBread",
      ownerId: player1Id,
      level: 1,
      integrity: 100,
      position: { x: 7, y: 3 },
      connectedToRoad: true,
      inputBuffer: { amnioticWater: 10 }, // Missing bone dust to start, which the mill should provide
      outputBuffer: {},
      internalStorage: {},
      assignedWorkers: [acolyteId],
      currentRecipeId: "bakeFuneralLoaf",
      progressSec: 0,
      isActive: true
    }
  },
  workers: {
    [millerId]: {
      id: millerId,
      type: "dustMiller",
      ownerId: player1Id,
      homeBuildingId: millId,
      position: { x: 3, y: 3 },
      isIdle: false,
      morale: 100,
      infection: 0,
      scars: 0
    },
    [acolyteId]: {
      id: acolyteId,
      type: "ovenAcolyte",
      ownerId: player1Id,
      homeBuildingId: ovenId,
      position: { x: 7, y: 3 },
      isIdle: false,
      morale: 100,
      infection: 0,
      scars: 0
    },
    [carrier1Id]: {
      id: carrier1Id,
      type: "burdenThrall",
      ownerId: player1Id,
      position: { x: 5, y: 5 },
      isIdle: true,
      morale: 100,
      infection: 0,
      scars: 0
    },
    [carrier2Id]: {
      id: carrier2Id,
      type: "burdenThrall",
      ownerId: player1Id,
      position: { x: 5, y: 6 },
      isIdle: true,
      morale: 100,
      infection: 0,
      scars: 0
    }
  },
  territory: initialTerritory,
  transport: {
    roadNodes: {
      "road_3_3": { id: "road_3_3", position: { x: 3, y: 3 }, connectedNodeIds: ["road_4_3"] },
      "road_4_3": { id: "road_4_3", position: { x: 4, y: 3 }, connectedNodeIds: ["road_3_3", "road_5_3"] },
      "road_5_3": { id: "road_5_3", position: { x: 5, y: 3 }, connectedNodeIds: ["road_4_3", "road_6_3"] },
      "road_6_3": { id: "road_6_3", position: { x: 6, y: 3 }, connectedNodeIds: ["road_5_3", "road_7_3"] },
      "road_7_3": { id: "road_7_3", position: { x: 7, y: 3 }, connectedNodeIds: ["road_6_3"] },
    },
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
}));
