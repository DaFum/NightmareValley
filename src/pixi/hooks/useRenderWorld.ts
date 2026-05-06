import { useMemo, useRef } from "react";
import { useGameStore } from "../../store/game.store";
import {
  mapBuildingsToIsoBuildings,
  mapTerrainToIsoTiles,
  mapWorkersToIsoWorkers,
} from "../../game/render/render.adapter";
import { IsoRenderWorld } from "../../game/render/render.types";
import { createTerrainRenderCacheKey } from "../../game/render/render-cache";
import { useSelectionStore } from "../../store/selection.store";

export function useRenderWorld(): IsoRenderWorld {
  const territory = useGameStore((state) => state.gameState.territory);
  const buildings = useGameStore((state) => state.gameState.buildings);
  const workers = useGameStore((state) => state.gameState.workers);
  const transport = useGameStore((state) => state.gameState.transport);
  const selectedBuildingId = useSelectionStore((state) => state.selectedBuildingId);
  const selectedWorkerId = useSelectionStore((state) => state.selectedWorkerId);

  const terrainCacheRef = useRef<{ cacheKey: string; tiles: IsoRenderWorld['tiles'] } | null>(null);
  const terrainCacheKey = useMemo(() => createTerrainRenderCacheKey(territory), [territory]);
  const tiles = useMemo(() => {
    const cached = terrainCacheRef.current;
    if (cached && cached.cacheKey === terrainCacheKey) return cached.tiles;

    const mappedTiles = mapTerrainToIsoTiles({ territory });
    terrainCacheRef.current = { cacheKey: terrainCacheKey, tiles: mappedTiles };
    return mappedTiles;
  }, [terrainCacheKey, territory]);
  const mappedBuildings = useMemo(() => (
    mapBuildingsToIsoBuildings({ buildings }).map((building) => ({
      ...building,
      selected: building.id === selectedBuildingId,
    }))
  ), [buildings, selectedBuildingId]);
  const mappedWorkers = useMemo(
    () => mapWorkersToIsoWorkers({ workers, transport, buildings }).map((worker) => ({
      ...worker,
      selected: worker.id === selectedWorkerId,
    })),
    [workers, transport, buildings, selectedWorkerId]
  );

  return useMemo(() => ({
    tiles,
    buildings: mappedBuildings,
    workers: mappedWorkers,
  }), [tiles, mappedBuildings, mappedWorkers]);
}
