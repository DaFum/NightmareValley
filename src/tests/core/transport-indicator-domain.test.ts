import { getTransportIndicatorModel } from '../../store/transportIndicatorDomain';
import { player1Id } from '../../store/game.store';
import { createWorld } from '../../game/world/world.state';

describe('transportIndicatorDomain', () => {
  it('surfaces the transport next step, not only active and queued counts', () => {
    const world = createWorld(1234, 12, 12, player1Id);
    world.transport.queuedJobCount = 16;
    world.transport.activeCarrierTasks = {};

    const model = getTransportIndicatorModel(world, player1Id);

    expect(model.summary).toBe('Active 0 · Queued 16');
    expect(model.tone).toBe('warn');
    expect(model.headline).toBe('Transport queue is backing up');
    expect(model.detail).toContain('Hire more carriers');
    expect(model.title).toContain('Transport queue is backing up');
  });
});
