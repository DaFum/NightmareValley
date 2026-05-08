import { createWorkerDraft, getWorkerInspectorModel, listWorkerDomainTypes, planWorkerRoute, projectAssignedWorker, projectClearedWorker } from '../../store/workerDomain';
import type { BuildingInstance } from '../../game/core/game.types';

describe('workerDomain selectors', () => {
  it('exposes deterministic worker formatting/projection helpers', () => {
    const worker = createWorkerDraft('w1', 'burdenThrall', 'p1', 1, 2);
    const model = getWorkerInspectorModel(worker);

    expect(model?.status).toBe('idle');
    expect(model?.definition).toBeTruthy();

    const assigned = projectAssignedWorker(worker, { kind: 'hauling', targetBuildingId: 'b1' } as any);
    expect(assigned.isIdle).toBe(false);

    const cleared = projectClearedWorker(assigned);
    expect(cleared.isIdle).toBe(true);
  });

  it('keeps worker utility wrappers available', () => {
    const types = listWorkerDomainTypes();
    expect(types.length).toBeGreaterThan(0);

    const path = planWorkerRoute({} as any, { x: 0, y: 0 }, { x: 1, y: 1 });
    expect(path).toBeDefined();
  });

  it('explains carrier delivery state and idle reasons for the worker inspector', () => {
    const worker = createWorkerDraft('carrier-1', 'burdenThrall', 'p1', 1, 2);
    const buildings = {
      pickup: {
        id: 'pickup',
        type: 'organHarvester',
      } as BuildingInstance,
      dropoff: {
        id: 'dropoff',
        type: 'vaultOfDigestiveStone',
      } as BuildingInstance,
    };

    const idleModel = getWorkerInspectorModel(worker, undefined, buildings);
    expect(idleModel?.transport?.deliveryState).toBe('Idle');
    expect(idleModel?.transport?.carrying).toBe('Nothing');
    expect(idleModel?.transport?.idleReason).toContain('No active transport task');

    const haulingModel = getWorkerInspectorModel(
      { ...worker, isIdle: false },
      {
        workerId: 'carrier-1',
        jobId: 'job-1',
        pickupBuildingId: 'pickup',
        dropoffBuildingId: 'dropoff',
        resourceType: 'sinewTimber',
        amount: 2,
        phase: 'toDropoff',
        path: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
        pathIndex: 1,
        stepProgress: 0.5,
      },
      buildings,
    );

    expect(haulingModel?.transport?.deliveryState).toBe('Delivering');
    expect(haulingModel?.transport?.detail).toContain('Carrying 2 Sinew Timber');
    expect(haulingModel?.transport?.route).toBe('Organ Harvester -> Vault of Digestive Stone');
    expect(haulingModel?.transport?.progress).toBe('2/3 tiles');
    expect(haulingModel?.transport?.carrying).toBe('2 Sinew Timber');
    expect(haulingModel?.transport?.source).toBe('Organ Harvester');
    expect(haulingModel?.transport?.target).toBe('Vault of Digestive Stone');
    expect(haulingModel?.transport?.resource).toBe('Sinew Timber');
    expect(haulingModel?.transport?.amount).toBe(2);
    expect(haulingModel?.transport?.remainingDistance).toBe(1);
    expect(haulingModel?.transport?.idleReason).toBeNull();
  });

  it('does not show carrier transport guidance for idle production workers', () => {
    const worker = createWorkerDraft('producer-1', 'timberExecutioner', 'p1', 1, 2);

    const model = getWorkerInspectorModel(worker);

    expect(model?.transport).toBeNull();
  });
});
