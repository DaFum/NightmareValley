import { getSelectionSummary } from '../../game/ui/selection-summary';
import type { WorldState } from '../../game/world/world.types';

function stateFixture(): WorldState {
  return {
    tick: 0,
    ageOfTeeth: 0,
    seed: 1,
    lastDeltaSec: 0,
    players: {},
    buildings: {
      b1: {
        id: 'b1',
        type: 'organHarvester',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 2, y: 3 },
        connectedToRoad: false,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
    },
    workers: {
      w1: {
        id: 'w1',
        type: 'burdenThrall',
        ownerId: 'p1',
        position: { x: 1, y: 1 },
        isIdle: true,
        morale: 100,
        infection: 0,
        scars: 0,
      },
    },
    territory: {
      tiles: {
        t1: {
          id: 't1',
          position: { x: 5, y: 6 },
          terrain: 'ribMountain',
          ownerId: 'p1',
          resourceDeposit: { sepulcherStone: 8 },
          footfall: 0,
          tier: 'grass',
        },
      },
    },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  };
}

describe('getSelectionSummary', () => {
  it('summarizes building blockers first', () => {
    const summary = getSelectionSummary(stateFixture(), { selectedBuildingId: 'b1' });

    expect(summary).toEqual({
      kind: 'building',
      title: 'Organ Harvester',
      detail: 'Road missing',
      tone: 'warn',
    });
  });

  it('summarizes idle workers and tile deposits', () => {
    expect(getSelectionSummary(stateFixture(), { selectedWorkerId: 'w1' })).toMatchObject({
      kind: 'worker',
      title: 'Burden Thrall',
      detail: 'Idle',
      tone: 'idle',
    });
    expect(getSelectionSummary(stateFixture(), { selectedTileId: 't1' })).toMatchObject({
      kind: 'tile',
      detail: '5,6 - 8 sepulcherStone',
      tone: 'good',
    });
  });
});
