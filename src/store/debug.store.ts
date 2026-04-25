import { create } from 'zustand';

export interface LoopStats {
  stepsProcessed: number;
  carryoverSec: number;
  deltaSec: number;
  droppedFrameDebt: boolean;
  maxStepsBudget?: number;
  sustainedDebtFrames?: number;
  throttled?: boolean;
}

export interface DebugState {
  lastLoop: LoopStats;
  frameCounter: number;
  warnings: string[];
  setLoopStats: (stats: LoopStats) => void;
  resetDebugStats: () => void;
}

const initialLoopStats: LoopStats = {
  stepsProcessed: 0,
  carryoverSec: 0,
  deltaSec: 0,
  droppedFrameDebt: false,
  maxStepsBudget: 0,
  sustainedDebtFrames: 0,
  throttled: false,
};

export const useDebugStore = create<DebugState>((set) => ({
  lastLoop: initialLoopStats,
  frameCounter: 0,
  warnings: [],
  setLoopStats: (stats) =>
    set((state) => ({
      lastLoop: stats,
      frameCounter: state.frameCounter + 1,
      warnings: [
        ...(stats.throttled ? ['Simulation throttled due to sustained frame debt.'] : []),
      ],
    })),
  resetDebugStats: () => set({ lastLoop: initialLoopStats, frameCounter: 0, warnings: [] }),
}));
