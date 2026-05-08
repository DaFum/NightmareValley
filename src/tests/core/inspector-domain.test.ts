import { getInspectorTarget } from '../../store/inspectorDomain';
import { player1Id } from '../../store/game.store';
import type { WorldState } from '../../game/world/world.types';

describe('inspectorDomain', () => {
  it('returns a stale target when the selected building no longer exists', () => {
    const selectedBuildingId = 'building-1';
    const world = {
      players: { [player1Id]: { buildings: [selectedBuildingId], workers: ['worker-1'] } },
      buildings: { [selectedBuildingId]: { id: selectedBuildingId } },
      workers: { 'worker-1': { id: 'worker-1' } },
      territory: { tiles: { 'tile-1': { id: 'tile-1' } } },
    } as unknown as WorldState;
    delete world.buildings[selectedBuildingId];

    expect(getInspectorTarget(world, {
      selectedBuildingId,
      selectedWorkerId: null,
      selectedTileId: null,
    })).toEqual({
      kind: 'stale',
      missingKind: 'building',
      missingId: selectedBuildingId,
    });
  });

  it('returns worker target when selectedWorkerId is valid', () => {
    const world = {
      players: { [player1Id]: { buildings: ['building-1'], workers: ['worker-1'] } },
      buildings: { 'building-1': { id: 'building-1' } },
      workers: { 'worker-1': { id: 'worker-1' } },
      territory: { tiles: { 'tile-1': { id: 'tile-1' } } },
    } as unknown as WorldState;
    const workerId = 'worker-1';

    expect(getInspectorTarget(world, {
      selectedBuildingId: null,
      selectedWorkerId: workerId,
      selectedTileId: null,
    })).toEqual({ kind: 'worker', workerId });
  });

  it('returns tile target when selectedTileId is valid', () => {
    const world = {
      players: { [player1Id]: { buildings: ['building-1'], workers: ['worker-1'] } },
      buildings: { 'building-1': { id: 'building-1' } },
      workers: { 'worker-1': { id: 'worker-1' } },
      territory: { tiles: { 'tile-1': { id: 'tile-1' } } },
    } as unknown as WorldState;
    const tileId = 'tile-1';

    expect(getInspectorTarget(world, {
      selectedBuildingId: null,
      selectedWorkerId: null,
      selectedTileId: tileId,
    })).toEqual({ kind: 'tile', tileId });
  });
});
