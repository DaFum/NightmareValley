import { useTick } from '@pixi/react';
import { useGameStore } from '../../store/game.store';

export function useGameLoop() {
  const advanceTick = useGameStore(state => state.advanceTick);

  useTick((delta) => {
    const deltaSec = delta / 60;
    advanceTick(deltaSec);
  });
}
