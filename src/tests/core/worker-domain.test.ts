import { createWorkerDraft, getWorkerInspectorModel, listWorkerDomainTypes, planWorkerRoute, projectAssignedWorker, projectClearedWorker } from '../../store/workerDomain';

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
});
