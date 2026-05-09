import { getLogisticsSummaryModel } from '../../store/logisticsDomain';
import { getResourceLedger } from '../../store/resourceSummaryDomain';
import { getBuildingRoadDetails } from '../../store/roadLogisticsDomain';
import { getSimulationStatusModel } from '../../store/simulationStatusDomain';
import { getWorkerHireButtonState } from '../../store/hiringDomain';
import { player1Id } from '../../store/game.store';
import type { WorldState } from '../../game/world/world.types';

function makeWorld(overrides: Partial<WorldState> = {}): WorldState {
  const base = {
    tick: 0,
    ageOfTeeth: 0,
    players: {
      [player1Id]: {
        id: player1Id,
        name: 'Player',
        stock: {},
        buildings: ['vault'],
        workers: ['carrier'],
        territoryTileIds: [],
        populationLimit: 10,
        doctrine: 'industry',
        dread: 0,
        holinessDebt: 0,
      },
    },
    buildings: {
      vault: {
        id: 'vault',
        ownerId: player1Id,
        type: 'vaultOfDigestiveStone',
        level: 1,
        integrity: 100,
        position: { x: 0, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: { toothPlanks: 6, sinewTimber: 2 },
        internalStorage: {},
        assignedWorkers: ['carrier'],
        progressSec: 0,
        isActive: true,
      },
    },
    workers: {
      carrier: {
        id: 'carrier',
        ownerId: player1Id,
        type: 'burdenThrall',
        position: { x: 0, y: 0 },
        isIdle: true,
        morale: 100,
        infection: 0,
        scars: 0,
      },
    },
    territory: {
      tiles: {
        road0: { id: 'road0', ownerId: player1Id, position: { x: 0, y: 0 }, terrain: 'scarPath', footfall: 0, tier: 'dirt' },
        road1: { id: 'road1', ownerId: player1Id, position: { x: 1, y: 0 }, terrain: 'scarPath', footfall: 0, tier: 'dirt' },
      },
      tileIndex: { '0,0': 'road0', '1,0': 'road1' },
    },
    transport: {
      jobs: {},
      activeCarrierTasks: {},
      networkStress: 0,
      averageLatencySec: 0,
      queuedJobCount: 0,
    },
    worldPulse: 0,
  } as unknown as WorldState;

  return {
    ...base,
    ...overrides,
    players: overrides.players ?? base.players,
    buildings: overrides.buildings ?? base.buildings,
    workers: overrides.workers ?? base.workers,
    territory: overrides.territory ?? base.territory,
    transport: overrides.transport ?? base.transport,
  } as WorldState;
}

describe('QA visibility domain models', () => {
  it('explains zero active and zero queued logistics as no demand instead of bare idle', () => {
    const model = getLogisticsSummaryModel(makeWorld(), player1Id);

    expect(model.activeJobs).toBe(0);
    expect(model.queuedJobs).toBe(0);
    expect(model.whyIdle).toContain('no building currently requests resources');
    expect(model.recommendation).toContain('Build a production building');
  });

  it('reports blocked logistics when a real demand has no road path', () => {
    const world = makeWorld({
      players: {
        [player1Id]: {
          id: player1Id,
          name: 'Player',
          stock: {},
          buildings: ['vault', 'mill'],
          workers: ['carrier'],
          territoryTileIds: [],
          populationLimit: 10,
          doctrine: 'industry',
          dread: 0,
          holinessDebt: 0,
        },
      } as any,
      buildings: {
        vault: {
          id: 'vault',
          ownerId: player1Id,
          type: 'vaultOfDigestiveStone',
          level: 1,
          integrity: 100,
          position: { x: 0, y: 0 },
          connectedToRoad: true,
          inputBuffer: {},
          outputBuffer: { sinewTimber: 3 },
          internalStorage: {},
          assignedWorkers: ['carrier'],
          progressSec: 0,
          isActive: true,
        },
        mill: {
          id: 'mill',
          ownerId: player1Id,
          type: 'millOfGnashing',
          level: 1,
          integrity: 100,
          position: { x: 8, y: 0 },
          connectedToRoad: true,
          inputBuffer: {},
          outputBuffer: {},
          internalStorage: {},
          assignedWorkers: ['sawyer'],
          progressSec: 0,
          isActive: true,
        },
      } as any,
      workers: {
        carrier: {
          id: 'carrier',
          ownerId: player1Id,
          type: 'burdenThrall',
          position: { x: 0, y: 0 },
          isIdle: true,
          morale: 100,
          infection: 0,
          scars: 0,
        },
        sawyer: {
          id: 'sawyer',
          ownerId: player1Id,
          type: 'gnashSawyer',
          position: { x: 8, y: 0 },
          isIdle: false,
          morale: 100,
          infection: 0,
          scars: 0,
        },
      } as any,
    });

    const model = getLogisticsSummaryModel(world, player1Id);

    expect(model.blockedJobs).toBeGreaterThan(0);
    expect(model.whyIdle).toContain('no road path');
    expect(model.nextRequestedDelivery).toContain('Sinew Timber');
  });

  it('separates available, reserved, in-transit, input, and output resources', () => {
    const world = makeWorld({
      buildings: {
        vault: {
          ...(makeWorld().buildings.vault as any),
          outputBuffer: { sinewTimber: 5 },
        },
        mill: {
          id: 'mill',
          ownerId: player1Id,
          type: 'millOfGnashing',
          level: 1,
          integrity: 100,
          position: { x: 1, y: 0 },
          connectedToRoad: true,
          inputBuffer: { sinewTimber: 2 },
          outputBuffer: { toothPlanks: 1 },
          internalStorage: {},
          assignedWorkers: [],
          progressSec: 0,
          isActive: true,
        },
      } as any,
      transport: {
        jobs: {
          queued: {
            id: 'queued',
            fromBuildingId: 'vault',
            toBuildingId: 'mill',
            resourceType: 'sinewTimber',
            amount: 2,
            priority: 3,
            reserved: 0,
            delivered: 0,
            status: 'queued',
          },
        },
        activeCarrierTasks: {
          carrier: {
            workerId: 'carrier',
            jobId: 'claimed',
            pickupBuildingId: 'vault',
            dropoffBuildingId: 'mill',
            resourceType: 'sinewTimber',
            amount: 1,
            phase: 'toDropoff',
            path: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
            pathIndex: 0,
            stepProgress: 0,
          },
        },
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 1,
      } as any,
    });

    const ledger = getResourceLedger(world, player1Id);
    expect(ledger.sinewTimber.available).toBe(3);
    expect(ledger.sinewTimber.reserved).toBe(2);
    expect(ledger.sinewTimber.inTransit).toBe(1);
    expect(ledger.sinewTimber.inInputBuffers).toBe(2);
    expect(ledger.sinewTimber.inOutputBuffers).toBe(5);
  });

  it('exposes road distance and delivery estimates for selected buildings', () => {
    const world = makeWorld({
      players: {
        [player1Id]: {
          ...(makeWorld().players[player1Id] as any),
          buildings: ['vault', 'mill'],
        },
      } as any,
      buildings: {
        vault: makeWorld().buildings.vault,
        mill: {
          id: 'mill',
          ownerId: player1Id,
          type: 'millOfGnashing',
          level: 1,
          integrity: 100,
          position: { x: 6, y: 0 },
          connectedToRoad: true,
          inputBuffer: {},
          outputBuffer: {},
          internalStorage: {},
          assignedWorkers: [],
          progressSec: 0,
          isActive: true,
        },
      } as any,
    });

    const details = getBuildingRoadDetails(world, player1Id, world.buildings.mill);

    expect(details.status).toBe('Connected');
    expect(details.distanceToNearestVault).toBe(6);
    expect(details.estimatedDeliverySec).toBeGreaterThan(0);
  });

  it('communicates paused speed as selected speed, not active movement', () => {
    const paused = getSimulationStatusModel(false, 4);
    const running = getSimulationStatusModel(true, 4);

    expect(paused.label).toBe('Paused · selected speed 4x');
    expect(paused.pausePressed).toBe(true);
    expect(running.label).toBe('Fast-forward active · 4x');
  });

  it('disables hiring with a full-slot reason before cost checks', () => {
    const state = getWorkerHireButtonState({
      workerName: 'Burden Thrall',
      current: 2,
      max: 2,
      atPopulationCap: false,
      canAfford: true,
      missingCosts: [],
    });

    expect(state.disabled).toBe(true);
    expect(state.label).toBe('Full');
    expect(state.title).toContain('2/2 Burden Thralls already assigned');
  });
});
