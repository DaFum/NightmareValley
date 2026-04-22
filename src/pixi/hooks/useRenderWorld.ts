import { useGameStore } from "../../store/game.store";
import { mapEconomyStateToIsoWorld } from "../../game/render/render.adapter";
import { useMemo } from "react";

export function useRenderWorld() {
  const gameState = useGameStore((state) => state.gameState);

  const renderWorld = useMemo(() => {
    return mapEconomyStateToIsoWorld(gameState);
  }, [gameState]);

  return renderWorld;
}
