import { create } from 'zustand';

export type SelectionKind = 'building' | 'worker' | 'tile';

export interface SelectionState {
  selectedBuildingId: string | null;
  selectedWorkerId: string | null;
  selectedTileId: string | null;
  selectBuilding: (id: string | null) => void;
  selectWorker: (id: string | null) => void;
  selectTile: (id: string | null) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedBuildingId: null,
  selectedWorkerId: null,
  selectedTileId: null,

  selectBuilding: (id) => set({
    selectedBuildingId: id,
    selectedWorkerId: null,
    selectedTileId: null,
  }),

  selectWorker: (id) => set({
    selectedBuildingId: null,
    selectedWorkerId: id,
    selectedTileId: null,
  }),

  selectTile: (id) => set({
    selectedBuildingId: null,
    selectedWorkerId: null,
    selectedTileId: id,
  }),

  clearSelection: () => set({
    selectedBuildingId: null,
    selectedWorkerId: null,
    selectedTileId: null,
  }),
}));

