import { create } from 'zustand';
import { EconomySimulationState, simulateTick } from '../game/core/economy.simulation';
import { DEFAULT_SIMULATION_CONFIG } from '../game/economy/balancing.constants';

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
  players: {},
  buildings: {},
  workers: {},
  territory: { tiles: {} },
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
