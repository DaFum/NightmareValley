import { useMemo } from "react";
import { useGameStore } from "../../store/game.store";
import { mapEconomyStateToIsoWorld } from "../../game/render/render.adapter";
import { IsoRenderWorld } from "../../game/render/render.types";

export function useRenderWorld(): IsoRenderWorld {
  const gameState = useGameStore((state) => state.gameState);

  // Memoize the mapped render world so we don't recreate the entire IsoRenderWorld
  // object tree if the gameState object reference hasn't changed.
  const renderWorld = useMemo(() => {
    return mapEconomyStateToIsoWorld(gameState);
  }, [gameState]);

  return renderWorld;
}
