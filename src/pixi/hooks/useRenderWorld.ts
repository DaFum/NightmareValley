import { useMemo } from "react";
import { useGameStore } from "../../store/game.store";
import {
  mapBuildingsToIsoBuildings,
  mapTerrainToIsoTiles,
  mapWorkersToIsoWorkers,
} from "../../game/render/render.adapter";
import { IsoRenderWorld } from "../../game/render/render.types";
import { useSelectionStore } from "../../store/selection.store";

export function useRenderWorld(): IsoRenderWorld {
  const territory = useGameStore((state) => state.gameState.territory);
  const buildings = useGameStore((state) => state.gameState.buildings);
  const workers = useGameStore((state) => state.gameState.workers);
  const transport = useGameStore((state) => state.gameState.transport);
  const selectedBuildingId = useSelectionStore((state) => state.selectedBuildingId);
  const selectedWorkerId = useSelectionStore((state) => state.selectedWorkerId);

  const tiles = useMemo(() => mapTerrainToIsoTiles({ territory }), [territory]);
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
