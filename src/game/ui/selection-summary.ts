import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from '../core/economy.data';
import { ResourceType } from '../core/economy.types';
import type { WorldState } from '../world/world.types';

export type SelectionSummary =
  | {
      kind: 'building';
      title: string;
      detail: string;
      tone: 'good' | 'warn' | 'idle';
    }
  | {
      kind: 'worker';
      title: string;
      detail: string;
      tone: 'good' | 'warn' | 'idle';
    }
  | {
      kind: 'tile';
      title: string;
      detail: string;
      tone: 'good' | 'warn' | 'idle';
    };

function resourceList(deposit: Partial<Record<ResourceType, number>> | undefined): string {
  const entries = Object.entries(deposit ?? {})
    .filter(([, amount]) => (amount ?? 0) > 0)
    .slice(0, 2);
  if (entries.length === 0) return 'no deposits';
  return entries.map(([resource, amount]) => `${amount} ${resource}`).join(', ');
}

export function getSelectionSummary(
  state: WorldState,
  selection: {
    selectedBuildingId?: string | null;
    selectedWorkerId?: string | null;
    selectedTileId?: string | null;
  }
): SelectionSummary | null {
  if (selection.selectedBuildingId) {
    const building = state.buildings[selection.selectedBuildingId];
    if (!building) return null;
    const definition = BUILDING_DEFINITIONS[building.type];
    const assigned = building.assignedWorkers.length;
    const required = Object.values(definition.workerSlots).reduce((sum, value) => sum + (value ?? 0), 0);
    const needsRoad = definition.requiresRoadConnection && !building.connectedToRoad;
    const tone = needsRoad || assigned < required ? 'warn' : building.progressSec > 0 ? 'good' : 'idle';
    const detail = needsRoad
      ? 'Road missing'
      : assigned < required
        ? `Workers ${assigned}/${required}`
        : building.progressSec > 0
          ? 'Production active'
          : `Level ${building.level}/${definition.maxLevel}`;
    return {
      kind: 'building',
      title: definition.name,
      detail,
      tone,
    };
  }

  if (selection.selectedWorkerId) {
    const worker = state.workers[selection.selectedWorkerId];
    if (!worker) return null;
    const definition = WORKER_DEFINITIONS[worker.type];
    return {
      kind: 'worker',
      title: definition.name,
      detail: worker.currentJob ? `Job ${worker.currentJob.type}` : worker.isIdle ? 'Idle' : 'Moving',
      tone: worker.currentJob || !worker.isIdle ? 'good' : 'idle',
    };
  }

  if (selection.selectedTileId) {
    const tile = state.territory.tiles[selection.selectedTileId];
    if (!tile) return null;
    return {
      kind: 'tile',
      title: tile.terrain,
      detail: `${tile.position.x},${tile.position.y} - ${resourceList(tile.resourceDeposit)}`,
      tone: tile.ownerId ? 'good' : 'idle',
    };
  }

  return null;
}
