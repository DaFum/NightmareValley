import { useMemo } from "react";
import { useGameStore } from "../../store/game.store";
import { mapEconomyStateToIsoWorld } from "../../game/render/render.adapter";
import { IsoRenderWorld } from "../../game/render/render.types";

export function useRenderWorld(): IsoRenderWorld {
  // Use specific states to prevent re-rendering when other states change
  const territory = useGameStore((state) => state.gameState.territory);
  const buildings = useGameStore((state) => state.gameState.buildings);
  const workers = useGameStore((state) => state.gameState.workers);

  // Memoize the mapped render world so we don't recreate the entire IsoRenderWorld
  // object tree if the game state object hasn't changed conceptually.
  const renderWorld = useMemo(() => {
    // Construct a partial state with the things needed for mapping
    const partialState = {
      ...useGameStore.getState().gameState,
      territory,
      buildings,
      workers,
    };
    return mapEconomyStateToIsoWorld(partialState as any);
  }, [territory, buildings, workers]);

  return renderWorld;
}
