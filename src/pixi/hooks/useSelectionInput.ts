import { useCallback } from 'react';
import type * as PIXI from 'pixi.js';
import type { MutableRefObject } from 'react';
import type { IsoRenderWorld } from '../../game/render/render.types';
import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';
import { useUIStore } from '../../store/ui.store';
import { useIsoPointer } from './useIsoPointer';

interface SelectionInputOptions {
  world: IsoRenderWorld;
  centerX: number;
  centerY: number;
  cameraX: number;
  cameraY: number;
  zoom: number;
  spacePressedRef: MutableRefObject<boolean>;
}

export function useSelectionInput({
  world,
  centerX,
  centerY,
  cameraX,
  cameraY,
  zoom,
  spacePressedRef,
}: SelectionInputOptions) {
  const placeBuildingAt = useGameStore((state) => state.placeBuildingAt);
  const selectedBuildingToPlace = useUIStore((state) => state.selectedBuildingToPlace);
  const selectBuildingToPlace = useUIStore((state) => state.selectBuildingToPlace);
  const isDebugSpawningWarehouse = useUIStore((state) => state.isDebugSpawningWarehouse);
  const setDebugSpawningWarehouse = useUIStore((state) => state.setDebugSpawningWarehouse);
  const selectBuilding = useSelectionStore((state) => state.selectBuilding);
  const selectWorker = useSelectionStore((state) => state.selectWorker);
  const selectTile = useSelectionStore((state) => state.selectTile);

  const resolveIsoHit = useIsoPointer({
    world,
    centerX,
    centerY,
    cameraX,
    cameraY,
    zoom,
  });

  const getActivePlayerId = useCallback(() => {
    const playerIds = Object.keys(useGameStore.getState().gameState.players);
    return playerIds[0] ?? null;
  }, []);

  return useCallback((event: PIXI.FederatedPointerEvent) => {
    if (event.button !== 0) return;
    if (spacePressedRef.current) return;

    const hit = resolveIsoHit(event.global.x, event.global.y);
    if (isDebugSpawningWarehouse && hit.tileId && !hit.buildingId && !hit.workerId) {
      const activePlayerId = getActivePlayerId();
      if (!activePlayerId) return;
      placeBuildingAt(activePlayerId, 'vaultOfDigestiveStone', hit.tileId);
      setDebugSpawningWarehouse(false);
      return;
    }

    if (selectedBuildingToPlace && hit.tileId && !hit.buildingId && !hit.workerId) {
      const activePlayerId = getActivePlayerId();
      if (!activePlayerId) return;
      placeBuildingAt(activePlayerId, selectedBuildingToPlace, hit.tileId);
      selectBuildingToPlace(null);
      return;
    }

    if (hit.buildingId) {
      selectBuilding(hit.buildingId);
    } else if (hit.workerId) {
      selectWorker(hit.workerId);
    } else {
      selectTile(hit.tileId ?? null);
    }
  }, [
    getActivePlayerId,
    isDebugSpawningWarehouse,
    placeBuildingAt,
    resolveIsoHit,
    selectBuilding,
    selectBuildingToPlace,
    selectTile,
    selectWorker,
    selectedBuildingToPlace,
    setDebugSpawningWarehouse,
    spacePressedRef,
  ]);
}

export default useSelectionInput;
