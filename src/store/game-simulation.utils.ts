import { EconomySimulationState, simulateTick } from '../game/core/economy.simulation';
import { DEFAULT_SIMULATION_CONFIG } from '../game/economy/balancing.constants';

export interface SimulationStepResult {
  nextState: EconomySimulationState;
  stepsProcessed: number;
  carryoverSec: number;
  droppedFrameDebt: boolean;
  debugTrace?: SimulationStepTrace[];
}

export interface SimulationStepTrace {
  tick: number;
  ageOfTeeth: number;
  stepDeltaSec: number;
  stateHash: number;
}

export interface SimulationStepProfile {
  subsystem: 'economy' | 'transport' | 'pathing';
  multiplier: number;
}

export interface RunSimulationOptions {
  profile?: SimulationStepProfile[];
  captureTrace?: boolean;
  onTrace?: (entry: SimulationStepTrace) => void;
}

export function clampTickRate(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 1;
  return Math.max(1e-6, Math.min(1000, rate));
}

function defaultProfileMultiplier(profile?: SimulationStepProfile[]): number {
  if (!profile || profile.length === 0) return 1;
  const economy = profile.find((item) => item.subsystem === 'economy');
  if (!economy || !Number.isFinite(economy.multiplier) || economy.multiplier <= 0) return 1;
  return economy.multiplier;
}

function hashState(state: EconomySimulationState): number {
  const seed = `${state.tick}|${state.ageOfTeeth}|${Object.keys(state.buildings).length}|${Object.keys(state.workers).length}|${Object.keys(state.transport.jobs).length}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(hash, 31) + seed.charCodeAt(i) | 0;
  }
  return hash >>> 0;
}

export function runSimulationSteps(
  initialState: EconomySimulationState,
  deltaSec: number,
  tickRate: number,
  fixedStepSec: number,
  maxSteps: number,
  options?: RunSimulationOptions
): SimulationStepResult {
  if (deltaSec <= 0 || fixedStepSec <= 0 || maxSteps <= 0) {
    return {
      nextState: initialState,
      stepsProcessed: 0,
      carryoverSec: 0,
      droppedFrameDebt: false,
      debugTrace: options?.captureTrace ? [] : undefined,
    };
  }

  let stepsProcessed = 0;
  let accumulator = deltaSec;
  let nextState = initialState;
  const trace: SimulationStepTrace[] = [];
  const stepMultiplier = defaultProfileMultiplier(options?.profile);

  while (accumulator >= fixedStepSec && stepsProcessed < maxSteps) {
    const stepDeltaSec = fixedStepSec * tickRate * stepMultiplier;
    nextState = simulateTick(
      nextState,
      stepDeltaSec,
      DEFAULT_SIMULATION_CONFIG
    );

    if (options?.captureTrace || options?.onTrace) {
      const traceEntry: SimulationStepTrace = {
        tick: nextState.tick,
        ageOfTeeth: nextState.ageOfTeeth,
        stepDeltaSec,
        stateHash: hashState(nextState),
      };
      if (options?.captureTrace) trace.push(traceEntry);
      options?.onTrace?.(traceEntry);
    }

    accumulator -= fixedStepSec;
    stepsProcessed += 1;
  }

  const droppedFrameDebt = stepsProcessed === maxSteps && accumulator >= fixedStepSec;

  return {
    nextState,
    stepsProcessed,
    carryoverSec: Math.max(0, accumulator),
    droppedFrameDebt,
    debugTrace: options?.captureTrace ? trace : undefined,
  };
}
