import { create } from 'zustand';
import { BuildingType } from '../game/core/economy.types';

export interface UIStore {
  activePanel: 'buildingMenu' | 'inspector' | null;
  selectedBuildingToPlace: BuildingType | null;
  togglePanel: (panel: 'buildingMenu' | 'inspector') => void;
  selectBuildingToPlace: (type: BuildingType | null) => void;
  isDebugSpawningWarehouse: boolean;
  setDebugSpawningWarehouse: (v: boolean) => void;
  showFootfallHeatmap: boolean;
  toggleFootfallHeatmap: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  activePanel: null,
  selectedBuildingToPlace: null,
  isDebugSpawningWarehouse: false,
  showFootfallHeatmap: false,

  togglePanel: (panel) => {
    set({
      activePanel: get().activePanel === panel ? null : panel,
      selectedBuildingToPlace: panel !== 'buildingMenu' ? null : get().selectedBuildingToPlace,
    });
  },

  selectBuildingToPlace: (type) => {
    set({ selectedBuildingToPlace: type });
  },

  setDebugSpawningWarehouse: (v: boolean) => {
    set({ isDebugSpawningWarehouse: v });
  },

  toggleFootfallHeatmap: () => {
    set((state) => ({ showFootfallHeatmap: !state.showFootfallHeatmap }));
  },
}));
