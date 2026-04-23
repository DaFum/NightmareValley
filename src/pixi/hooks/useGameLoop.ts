import { useEffect, useRef } from "react";
import { useTick } from "@pixi/react";
import { useGameStore } from "../../store/game.store";

export function useGameLoop() {
  const advanceTick = useGameStore((state) => state.advanceTick);
  const isRunning = useGameStore((state) => state.isRunning);

  useTick((delta, ticker) => {
    if (isRunning) {
      // ticker.deltaMS is the elapsed time in milliseconds since the last frame
      const deltaSec = ticker.deltaMS / 1000;
      advanceTick(deltaSec);
    }
  });
}
