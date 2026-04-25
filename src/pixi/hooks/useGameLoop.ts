import { useRef } from 'react';
import { useTick } from '@pixi/react';
import { useGameStore } from '../../store/game.store';
import { useDebugStore } from '../../store/debug.store';

export const SIMULATION_STEP_SEC = 0.1;
export const BASE_MAX_STEPS_PER_FRAME = 5;
const MAX_CARRYOVER_SEC = SIMULATION_STEP_SEC * 2;
const MAX_ADAPTIVE_STEPS = 8;
const MIN_ADAPTIVE_STEPS = 2;
const DEBT_STREAK_THROTTLE_FRAMES = 20;

export function useGameLoop() {
  const runSimulationSteps = useGameStore((state) => state.runSimulationSteps);
  const isRunning = useGameStore((state) => state.isRunning);
  const setLoopStats = useDebugStore((state) => state.setLoopStats);
  const accumulatorRef = useRef(0);
  const debtStreakRef = useRef(0);
  const economyStepMultiplier = (carryoverSec: number) => (carryoverSec > SIMULATION_STEP_SEC * 1.5 ? 0.9 : 1);

  const getAdaptiveStepBudget = (deltaSec: number) => {
    const budgetScale = Math.min(1.6, Math.max(0.7, deltaSec / SIMULATION_STEP_SEC));
    const computed = Math.round(BASE_MAX_STEPS_PER_FRAME / budgetScale);
    return Math.max(MIN_ADAPTIVE_STEPS, Math.min(MAX_ADAPTIVE_STEPS, computed));
  };

  useTick((deltaFrames) => {
    // @pixi/react v7 useTick callback receives frame delta (1 ~= 60fps frame).
    const deltaSec = Math.min(deltaFrames / 60, 0.25);
    if (!Number.isFinite(deltaSec) || deltaSec <= 0) {
      return;
    }

    if (!isRunning) {
      accumulatorRef.current = 0;
      debtStreakRef.current = 0;
      setLoopStats({
        stepsProcessed: 0,
        carryoverSec: 0,
        deltaSec,
        droppedFrameDebt: false,
        maxStepsBudget: BASE_MAX_STEPS_PER_FRAME,
        sustainedDebtFrames: 0,
        throttled: false,
      });
      return;
    }

    accumulatorRef.current += deltaSec;
    const maxStepsThisFrame = getAdaptiveStepBudget(deltaSec);
    const stepProfile = [
      { subsystem: 'economy' as const, multiplier: economyStepMultiplier(accumulatorRef.current) },
    ];

    const {
      stepsProcessed,
      carryoverSec,
      droppedFrameDebt,
    } = runSimulationSteps(
      accumulatorRef.current,
      SIMULATION_STEP_SEC,
      maxStepsThisFrame,
      stepProfile
    );

    accumulatorRef.current = carryoverSec;
    debtStreakRef.current = droppedFrameDebt ? debtStreakRef.current + 1 : 0;
    const throttled = debtStreakRef.current >= DEBT_STREAK_THROTTLE_FRAMES;

    // Keep a bounded carry-over budget instead of zeroing completely,
    // so the simulation catches up smoothly under frame spikes.
    if (stepsProcessed === maxStepsThisFrame && accumulatorRef.current > MAX_CARRYOVER_SEC) {
      if (throttled) {
        accumulatorRef.current = Math.min(accumulatorRef.current, SIMULATION_STEP_SEC);
      } else {
        accumulatorRef.current = MAX_CARRYOVER_SEC;
      }
    }

    setLoopStats({
      stepsProcessed,
      carryoverSec: accumulatorRef.current,
      deltaSec,
      droppedFrameDebt,
      maxStepsBudget: maxStepsThisFrame,
      sustainedDebtFrames: debtStreakRef.current,
      throttled,
    });
  });
}
