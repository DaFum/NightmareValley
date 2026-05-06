import { getProductionStatus } from '../../game/entities/buildings/building.status';
import { EconomySimulationState } from '../../game/core/economy.simulation';
import { BuildingType, WorkerType } from '../../game/core/economy.types';
import { DEFAULT_SIMULATION_CONFIG } from '../../game/economy/balancing.constants';

function makeBuilding(type: BuildingType, overrides: Record<string, unknown> = {}) {
  return {
    id: 'b1',
    type,
    ownerId: 'p1',
    level: 1,
    constructionProgress: undefined,
    integrity: 100,
    position: { x: 0, y: 0 },
    connectedToRoad: true,
    inputBuffer: {},
    outputBuffer: {},
    internalStorage: {},
    assignedWorkers: [],
    progressSec: 0,
    isActive: true,
    corruption: 0,
    ...overrides,
  } as any;
}

function makeState(building: any, workerType?: WorkerType): EconomySimulationState {
  const workers: EconomySimulationState['workers'] = {};
  if (workerType) {
    workers.w1 = {
      id: 'w1',
      type: workerType,
      ownerId: 'p1',
      position: building.position,
      isIdle: false,
    } as any;
  }
  return {
    tick: 0,
    ageOfTeeth: 0,
    players: { p1: { id: 'p1', stock: {}, buildings: ['b1'], workers: Object.keys(workers) } as any },
    buildings: { b1: building },
    workers,
    territory: { tiles: {}, tileIndex: {} } as any,
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  };
}

describe('getProductionStatus', () => {
  it.each([
    ['paused', makeBuilding('millOfGnashing', { isActive: false }), undefined],
    ['underConstruction', makeBuilding('millOfGnashing', { level: 0, constructionProgress: 0.5 }), undefined],
    ['roadDisconnected', makeBuilding('millOfGnashing', { connectedToRoad: false }), undefined],
    ['missingWorker', makeBuilding('millOfGnashing', { inputBuffer: { sinewTimber: 1 } }), undefined],
    ['missingInput', makeBuilding('millOfGnashing', { assignedWorkers: ['w1'], inputBuffer: {} }), 'gnashSawyer'],
    ['outputFull', makeBuilding('millOfGnashing', { assignedWorkers: ['w1'], inputBuffer: { sinewTimber: 1 }, outputBuffer: { toothPlanks: DEFAULT_SIMULATION_CONFIG.buildingOutputBufferLimit } }), 'gnashSawyer'],
    ['working', makeBuilding('millOfGnashing', { assignedWorkers: ['w1'], inputBuffer: { sinewTimber: 1 }, progressSec: 1 }), 'gnashSawyer'],
    ['idle', makeBuilding('millOfGnashing', { assignedWorkers: ['w1'], inputBuffer: { sinewTimber: 1 }, progressSec: 0 }), 'gnashSawyer'],
  ] as const)('returns %s for a matching production condition', (expectedKind, building, workerType) => {
    const state = makeState(building, workerType);

    expect(getProductionStatus(state, building, DEFAULT_SIMULATION_CONFIG).kind).toBe(expectedKind);
  });
});
