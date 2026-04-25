import { create } from 'zustand';

export interface RenderStats {
  visibleTiles: number;
  visibleBuildings: number;
  visibleWorkers: number;
  lodLevel?: 'full' | 'medium' | 'low';
}

export interface RenderStoreState {
  stats: RenderStats;
  warnings: string[];
  setRenderStats: (stats: RenderStats) => void;
}

export const useRenderStore = create<RenderStoreState>((set) => ({
  stats: {
    visibleTiles: 0,
    visibleBuildings: 0,
    visibleWorkers: 0,
    lodLevel: 'full',
  },
  warnings: [],
  setRenderStats: (stats) =>
    set({
      stats,
      warnings: [
        ...(stats.visibleTiles > 1800 ? [`High tile visibility: ${stats.visibleTiles}`] : []),
        ...(stats.visibleWorkers > 300 ? [`High worker visibility: ${stats.visibleWorkers}`] : []),
      ],
    }),
}));
