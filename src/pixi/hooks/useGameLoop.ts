import { useRef } from 'react';
import { useTick } from '@pixi/react';
import { useGameStore } from '../../store/game.store';

export const SIMULATION_STEP_SEC = 0.1;
export const MAX_STEPS_PER_FRAME = 5;

export function useGameLoop() {
  const advanceTick = useGameStore((state) => state.advanceTick);
  const isRunning = useGameStore((state) => state.isRunning);
  const accumulatorRef = useRef(0);

  useTick((deltaFrames) => {
    // @pixi/react v7 useTick callback receives frame delta (1 ~= 60fps frame).
    const deltaSec = Math.min(deltaFrames / 60, 0.25);
    if (!Number.isFinite(deltaSec) || deltaSec <= 0) {
      return;
    }

    if (!isRunning) {
      accumulatorRef.current = 0;
      return;
    }

    accumulatorRef.current += deltaSec;
    let steps = 0;
    while (accumulatorRef.current >= SIMULATION_STEP_SEC && steps < MAX_STEPS_PER_FRAME) {
      advanceTick(SIMULATION_STEP_SEC);
      accumulatorRef.current -= SIMULATION_STEP_SEC;
      steps += 1;
    }

    if (steps === MAX_STEPS_PER_FRAME && accumulatorRef.current >= SIMULATION_STEP_SEC) {
      accumulatorRef.current = 0;
    }
  });
}
