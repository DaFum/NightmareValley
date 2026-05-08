import { getTransportIndicatorModel } from '../../store/transportIndicatorDomain';
import { player1Id } from '../../store/game.store';
import { createWorld } from '../../game/world/world.state';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('transportIndicatorDomain', () => {
  it('surfaces the transport next step, not only active and queued counts', () => {
    const world = createWorld(1234, 12, 12, player1Id);
    world.transport.queuedJobCount = 16;
    world.transport.activeCarrierTasks = {};
    const sourceBuildingId = world.players[player1Id].buildings[0];
    world.transport.jobs = Object.fromEntries(
      Array.from({ length: 16 }, (_, index) => [`job-${index}`, {
        id: `job-${index}`,
        fromBuildingId: sourceBuildingId,
        toBuildingId: sourceBuildingId,
        resourceType: 'toothPlanks',
        amount: 1,
        priority: 3,
        reserved: 0,
        delivered: 0,
        status: 'queued',
      }]),
    );

    const model = getTransportIndicatorModel(world, player1Id);

    expect(model.summary).toBe('Active 0 · Queued 16');
    expect(model.tone).toBe('warn');
    expect(model.headline).toBe('Transport queue is backing up');
    expect(model.detail).toContain('Hire more carriers');
    expect(model.title).toContain('Transport queue is backing up');
  });

  it('falls back to queuedJobCount when job records are unavailable', () => {
    const world = createWorld(5678, 12, 12, player1Id);
    world.transport.queuedJobCount = 5;
    world.transport.jobs = {};

    const model = getTransportIndicatorModel(world, player1Id);

    expect(model.summary).toBe('Active 0 · Queued 5');
  });

  it('builds indicator titles without dangling separators when detail is empty', () => {
    const source = readFileSync(join(process.cwd(), 'src/store/transportIndicatorDomain.ts'), 'utf8');

    expect(source).toContain('const title = normalizedDetail ? `${headline}: ${normalizedDetail}` : headline;');
    expect(source).toContain('title,');
    expect(source).not.toContain('title: `${headline}: ${normalizedDetail}`');
  });
});
