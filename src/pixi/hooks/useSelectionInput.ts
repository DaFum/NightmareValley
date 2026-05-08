import { useCallback, useEffect, useRef } from 'react';
import type * as PIXI from 'pixi.js';
import type { MutableRefObject } from 'react';
import type { IsoRenderWorld } from '../../game/render/render.types';
import { useGameStore, player1Id } from '../../store/game.store';
import { resolvePointerToTile } from '../../store/mapInteractionDomain';
import { useSelectionStore } from '../../store/selection.store';
import { useUIStore } from '../../store/ui.store';
import { useIsoPointer } from './useIsoPointer';
import { BUILDING_DEFINITIONS } from '../../game/core/economy.data';
import { canAffordBuildingForPlayer, getPlacementValidation } from '../../store/simulation.selectors';
import { canPlaceRoadForPlayer, isRemovableRoadTile } from '../../game/entities/roads/road.api';
import { getRoadPlacementReasonMessage } from '../../store/placementFeedbackDomain';

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
  const gameState = useGameStore((state) => state.gameState);
  const placeBuildingAt = useGameStore((state) => state.placeBuildingAt);
  const placeRoadAt = useGameStore((state) => state.placeRoadAt);
  const removeRoadAt = useGameStore((state) => state.removeRoadAt);
  const selectedBuildingToPlace = useUIStore((state) => state.selectedBuildingToPlace);
  const selectBuildingToPlace = useUIStore((state) => state.selectBuildingToPlace);
  const roadPlacementMode = useUIStore((state) => state.roadPlacementMode);
  const roadRemovalMode = useUIStore((state) => state.roadRemovalMode);
  const isDebugSpawningWarehouse = useUIStore((state) => state.isDebugSpawningWarehouse);
  const setDebugSpawningWarehouse = useUIStore((state) => state.setDebugSpawningWarehouse);
  const setPlacementFeedback = useUIStore((state) => state.setPlacementFeedback);
  const clearPlacementFeedback = useUIStore((state) => state.clearPlacementFeedback);
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
  const resolveIsoHitRef = useRef(resolveIsoHit);
  useEffect(() => {
    resolveIsoHitRef.current = resolveIsoHit;
  }, [resolveIsoHit]);

  return useCallback((event: PIXI.FederatedPointerEvent) => {
    if (event.button !== 0) return;
    if (spacePressedRef.current) return;

    const hit = resolveIsoHitRef.current(event.global.x, event.global.y);
    const tileRef = resolvePointerToTile(gameState, event.global.x, event.global.y, centerX + cameraX, centerY + cameraY, zoom);
    const tileId = tileRef?.tile.id ?? hit.tileId;
    const tile = tileId ? gameState.territory.tiles[tileId] : undefined;

    if (selectedBuildingToPlace) {
      const definition = BUILDING_DEFINITIONS[selectedBuildingToPlace];
      const label = definition?.name ?? selectedBuildingToPlace;

      if (!tile) {
        setPlacementFeedback({
          tone: 'warn',
          label: `Cannot place ${label}`,
          detail: 'Move the cursor back over known ground.',
        });
        return;
      }

      if (hit.workerId) {
        setPlacementFeedback({
          tone: 'warn',
          label: `Cannot place ${label}`,
          detail: 'A worker is standing on this tile. Wait for the tile to clear or choose another spot.',
        });
        return;
      }

      if (!canAffordBuildingForPlayer(gameState, player1Id, selectedBuildingToPlace)) {
        setPlacementFeedback({
          tone: 'warn',
          label: `Cannot place ${label}`,
          detail: 'The vault lacks the required build materials. Open Build to see missing costs.',
        });
        return;
      }

      const validation = getPlacementValidation(
        gameState,
        player1Id,
        selectedBuildingToPlace,
        tile.position.x,
        tile.position.y,
      );

      if (!validation.ok) {
        setPlacementFeedback({
          tone: 'warn',
          label: `Cannot place ${label}`,
          detail: validation.message,
        });
        return;
      }

      const placed = placeBuildingAt(player1Id, selectedBuildingToPlace, tile.id);
      if (placed) {
        clearPlacementFeedback();
        selectBuildingToPlace(null);
      } else {
        setPlacementFeedback({
          tone: 'warn',
          label: `Cannot place ${label}`,
          detail: 'Placement was rejected by the simulation. Try a nearby owned valid tile.',
        });
      }
      return;
    }

    if (roadPlacementMode) {
      if (!tile) {
        setPlacementFeedback({
          tone: 'warn',
          label: 'Road blocked',
          detail: 'Move the cursor back over known ground.',
        });
        return;
      }
      if (hit.workerId) {
        setPlacementFeedback({
          tone: 'warn',
          label: 'Road blocked',
          detail: 'A worker is standing on this tile. Wait for the tile to clear or route around it.',
        });
        return;
      }
      const roadValidation = canPlaceRoadForPlayer(gameState.territory, tile.position.x, tile.position.y, player1Id);
      if (!roadValidation.ok) {
        setPlacementFeedback({
          tone: 'warn',
          label: 'Road blocked',
          detail: getRoadPlacementReasonMessage(roadValidation.reason),
        });
        return;
      }
      placeRoadAt(player1Id, tile.id);
      clearPlacementFeedback();
      return;
    }

    if (roadRemovalMode) {
      if (!tile || tile.ownerId !== player1Id) {
        setPlacementFeedback({
          tone: 'warn',
          label: 'Cannot clear road',
          detail: 'Only owned road tiles can be removed.',
        });
        return;
      }
      if (hit.workerId || hit.buildingId) {
        setPlacementFeedback({
          tone: 'warn',
          label: 'Cannot clear road',
          detail: 'Clear roads only on empty road tiles.',
        });
        return;
      }
      if (!isRemovableRoadTile(tile)) {
        setPlacementFeedback({
          tone: 'warn',
          label: 'Cannot clear road',
          detail: 'Select an owned scar path tile to remove.',
        });
        return;
      }
      removeRoadAt(player1Id, tile.id);
      clearPlacementFeedback();
      return;
    }

    if (isDebugSpawningWarehouse && tileId && !hit.buildingId && !hit.workerId) {
      const placed = placeBuildingAt(player1Id, 'vaultOfDigestiveStone', tileId);
      if (placed) setDebugSpawningWarehouse(false);
      return;
    }

    if (hit.buildingId) {
      clearPlacementFeedback();
      selectBuilding(hit.buildingId);
    } else if (hit.workerId) {
      clearPlacementFeedback();
      selectWorker(hit.workerId);
    } else {
      clearPlacementFeedback();
      selectTile(tileId ?? null);
    }
  }, [
    clearPlacementFeedback,
    isDebugSpawningWarehouse,
    placeBuildingAt,
    placeRoadAt,
    removeRoadAt,
    roadPlacementMode,
    roadRemovalMode,
    selectBuilding,
    selectBuildingToPlace,
    selectTile,
    selectWorker,
    selectedBuildingToPlace,
    setPlacementFeedback,
    setDebugSpawningWarehouse,
    spacePressedRef,
    gameState,
    centerX,
    cameraX,
    centerY,
    cameraY,
    zoom,
  ]);
}

export default useSelectionInput;

