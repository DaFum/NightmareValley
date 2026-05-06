import { create } from 'zustand';
import { BuildingType } from '../game/core/economy.types';

export interface UIStore {
  activePanel: 'buildingMenu' | 'inspector' | null;
  selectedBuildingToPlace: BuildingType | null;
  roadPlacementMode: boolean;
  roadRemovalMode: boolean;
  togglePanel: (panel: 'buildingMenu' | 'inspector') => void;
  selectBuildingToPlace: (type: BuildingType | null) => void;
  setRoadPlacementMode: (value: boolean) => void;
  setRoadRemovalMode: (value: boolean) => void;
  toggleRoadPlacementMode: () => void;
  toggleRoadRemovalMode: () => void;
  focusMode: boolean;
  minimalHud: boolean;
  guideOpen: boolean;
  autosaveEnabled: boolean;
  setFocusMode: (value: boolean) => void;
  setMinimalHud: (value: boolean) => void;
  setGuideOpen: (value: boolean) => void;
  setAutosaveEnabled: (value: boolean) => void;
  toggleFocusMode: () => void;
  toggleMinimalHud: () => void;
  toggleGuideOpen: () => void;
  toggleAutosaveEnabled: () => void;
  isDebugSpawningWarehouse: boolean;
  setDebugSpawningWarehouse: (v: boolean) => void;
  showFootfallHeatmap: boolean;
  toggleFootfallHeatmap: () => void;
}

function readStoredFlag(key: string, fallback = false) {
  try {
    return localStorage.getItem(key) === '1' || (fallback && localStorage.getItem(key) !== '0');
  } catch {
    return fallback;
  }
}

function writeStoredFlag(key: string, value: boolean) {
  try {
    if (value) localStorage.setItem(key, '1');
    else localStorage.setItem(key, '0');
  } catch {
    // Local storage can be unavailable in private or test contexts.
  }
}

export const useUIStore = create<UIStore>((set, get) => ({
  activePanel: null,
  selectedBuildingToPlace: null,
  roadPlacementMode: false,
  roadRemovalMode: false,
  focusMode: readStoredFlag('ui:focus'),
  minimalHud: readStoredFlag('ui:minimalHud', readStoredFlag('ui:hudHidden')),
  guideOpen: readStoredFlag('ui:guideOpen', true),
  autosaveEnabled: readStoredFlag('ui:autosaveEnabled', true),
  isDebugSpawningWarehouse: false,
  showFootfallHeatmap: false,

  togglePanel: (panel) => {
    set({
      activePanel: get().activePanel === panel ? null : panel,
      selectedBuildingToPlace: panel !== 'buildingMenu' ? null : get().selectedBuildingToPlace,
      roadPlacementMode: panel !== 'buildingMenu' ? false : get().roadPlacementMode,
      roadRemovalMode: panel !== 'buildingMenu' ? false : get().roadRemovalMode,
    });
  },

  selectBuildingToPlace: (type) => {
    set({ selectedBuildingToPlace: type, roadPlacementMode: false, roadRemovalMode: false });
  },

  setRoadPlacementMode: (value) => {
    set({
      roadPlacementMode: value,
      roadRemovalMode: value ? false : get().roadRemovalMode,
      selectedBuildingToPlace: value ? null : get().selectedBuildingToPlace,
    });
  },

  setRoadRemovalMode: (value) => {
    set({
      roadRemovalMode: value,
      roadPlacementMode: value ? false : get().roadPlacementMode,
      selectedBuildingToPlace: value ? null : get().selectedBuildingToPlace,
    });
  },

  toggleRoadPlacementMode: () => {
    get().setRoadPlacementMode(!get().roadPlacementMode);
  },

  toggleRoadRemovalMode: () => {
    get().setRoadRemovalMode(!get().roadRemovalMode);
  },

  setFocusMode: (value) => {
    writeStoredFlag('ui:focus', value);
    set({ focusMode: value });
  },

  setMinimalHud: (value) => {
    writeStoredFlag('ui:minimalHud', value);
    try { localStorage.removeItem('ui:hudHidden'); } catch {}
    set({ minimalHud: value });
  },

  setGuideOpen: (value) => {
    writeStoredFlag('ui:guideOpen', value);
    set({ guideOpen: value });
  },

  setAutosaveEnabled: (value) => {
    writeStoredFlag('ui:autosaveEnabled', value);
    set({ autosaveEnabled: value });
  },

  toggleFocusMode: () => get().setFocusMode(!get().focusMode),

  toggleMinimalHud: () => get().setMinimalHud(!get().minimalHud),

  toggleGuideOpen: () => get().setGuideOpen(!get().guideOpen),

  toggleAutosaveEnabled: () => get().setAutosaveEnabled(!get().autosaveEnabled),

  setDebugSpawningWarehouse: (v: boolean) => {
    set({ isDebugSpawningWarehouse: v });
  },

  toggleFootfallHeatmap: () => {
    set((state) => ({ showFootfallHeatmap: !state.showFootfallHeatmap }));
  },
}));
