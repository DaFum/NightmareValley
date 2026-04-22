import { useTick } from '@pixi/react';
import { useGameStore } from '../../store/game.store';

export function useGameLoop() {
  const advanceTick = useGameStore(state => state.advanceTick);

  useTick((delta, ticker) => {
    // Pixi ticker's deltaMS is available in recent versions, or use elapsedMS / 1000
    // ticker is passed as second argument in some versions of @pixi/react
    // Let's use ticker.elapsedMS if available, or just assume ~16.6ms per frame
    const deltaSec = ticker?.elapsedMS ? ticker.elapsedMS / 1000 : 1 / 60;

    advanceTick(deltaSec);
  });
}
