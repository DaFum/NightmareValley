import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/game.store';
import { useDebugStore } from '../../store/debug.store';

export const SIMULATION_STEP_SEC = 0.2;
export const BASE_MAX_STEPS_PER_FRAME = 5;
const MAX_CARRYOVER_SEC = SIMULATION_STEP_SEC * 2;
const MAX_ADAPTIVE_STEPS = 8;
const MIN_ADAPTIVE_STEPS = 2;
const DEBT_STREAK_THROTTLE_FRAMES = 20;

function economyStepMultiplier(carryoverSec: number): number {
  return carryoverSec > SIMULATION_STEP_SEC * 1.5 ? 0.9 : 1;
}

// Intentionally gives slow frames a *smaller* step budget, not a larger one.
// A slow frame is already overloaded; letting it run extra simulation steps would
// deepen the stall. The carry-over accumulator and debt-streak throttle handle
// catch-up across subsequent frames once the spike resolves.
function getAdaptiveStepBudget(deltaSec: number): number {
  const budgetScale = Math.min(1.6, Math.max(0.7, deltaSec / SIMULATION_STEP_SEC));
  const computed = Math.round(BASE_MAX_STEPS_PER_FRAME / budgetScale);
  return Math.max(MIN_ADAPTIVE_STEPS, Math.min(MAX_ADAPTIVE_STEPS, computed));
}

export function useGameLoop() {
  const runSimulationSteps = useGameStore((state) => state.runSimulationSteps);
  const isRunning = useGameStore((state) => state.isRunning);
  const setLoopStats = useDebugStore((state) => state.setLoopStats);
  const accumulatorRef = useRef(0);
  const debtStreakRef = useRef(0);
  const lastStatsUpdateRef = useRef(0);
  const pausedStatsReportedRef = useRef(false);

  useEffect(() => {
    let frameId: number | null = null;
    let lastFrameAt = performance.now();

    const frame = (now: number) => {
      const deltaSec = Math.min((now - lastFrameAt) / 1000, 0.25);
      lastFrameAt = now;

      if (!Number.isFinite(deltaSec) || deltaSec <= 0) {
        frameId = window.requestAnimationFrame(frame);
        return;
      }

      if (!isRunning) {
        accumulatorRef.current = 0;
        debtStreakRef.current = 0;
        if (!pausedStatsReportedRef.current) {
          setLoopStats({
            stepsProcessed: 0,
            carryoverSec: 0,
            deltaSec,
            droppedFrameDebt: false,
            maxStepsBudget: BASE_MAX_STEPS_PER_FRAME,
            sustainedDebtFrames: 0,
            throttled: false,
          });
          pausedStatsReportedRef.current = true;
        }
        frameId = window.requestAnimationFrame(frame);
        return;
      }
      pausedStatsReportedRef.current = false;

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

      if (stepsProcessed > 0 || droppedFrameDebt || now - lastStatsUpdateRef.current > 250) {
        lastStatsUpdateRef.current = now;
        setLoopStats({
          stepsProcessed,
          carryoverSec: accumulatorRef.current,
          deltaSec,
          droppedFrameDebt,
          maxStepsBudget: maxStepsThisFrame,
          sustainedDebtFrames: debtStreakRef.current,
          throttled,
        });
      }

      frameId = window.requestAnimationFrame(frame);
    };

    frameId = window.requestAnimationFrame(frame);
    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [isRunning, runSimulationSteps, setLoopStats]);
}
