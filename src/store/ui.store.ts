import { create } from 'zustand';
import { BuildingType } from '../game/core/economy.types';

export interface UIStore {
  activePanel: 'buildingMenu' | 'inspector' | null;
  selectedBuildingToPlace: BuildingType | null;
  togglePanel: (panel: 'buildingMenu' | 'inspector') => void;
  selectBuildingToPlace: (type: BuildingType | null) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  activePanel: null,
  selectedBuildingToPlace: null,

  togglePanel: (panel) => {
    set({
      activePanel: get().activePanel === panel ? null : panel,
      selectedBuildingToPlace: panel !== 'buildingMenu' ? null : get().selectedBuildingToPlace,
    });
  },

  selectBuildingToPlace: (type) => {
    set({ selectedBuildingToPlace: type });
  },
}));
