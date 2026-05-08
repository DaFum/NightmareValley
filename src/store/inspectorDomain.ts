import type { WorldState } from '../game/world/world.types';

export type InspectorSelectionInput = {
  selectedBuildingId: string | null;
  selectedWorkerId: string | null;
  selectedTileId: string | null;
};

export type InspectorTarget =
  | { kind: 'building'; buildingId: string }
  | { kind: 'worker'; workerId: string }
  | { kind: 'tile'; tileId: string }
  | { kind: 'stale'; missingKind: 'building' | 'worker' | 'tile'; missingId: string }
  | { kind: 'none' };

export function getInspectorTarget(state: WorldState, selection: InspectorSelectionInput): InspectorTarget {
  if (selection.selectedBuildingId) {
    return state.buildings[selection.selectedBuildingId]
      ? { kind: 'building', buildingId: selection.selectedBuildingId }
      : { kind: 'stale', missingKind: 'building', missingId: selection.selectedBuildingId };
  }

  if (selection.selectedWorkerId) {
    return state.workers[selection.selectedWorkerId]
      ? { kind: 'worker', workerId: selection.selectedWorkerId }
      : { kind: 'stale', missingKind: 'worker', missingId: selection.selectedWorkerId };
  }

  if (selection.selectedTileId) {
    return state.territory.tiles[selection.selectedTileId]
      ? { kind: 'tile', tileId: selection.selectedTileId }
      : { kind: 'stale', missingKind: 'tile', missingId: selection.selectedTileId };
  }

  return { kind: 'none' };
}
