import { getInspectorTarget } from '../../store/inspectorDomain';
import { useGameStore, player1Id } from '../../store/game.store';

describe('inspectorDomain', () => {
  it('returns a stale target when the selected building no longer exists', () => {
    const world = structuredClone(useGameStore.getState().gameState);
    const selectedBuildingId = world.players[player1Id].buildings[0];
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

  it('preserves valid worker and tile selections', () => {
    const world = structuredClone(useGameStore.getState().gameState);
    const workerId = world.players[player1Id].workers[0];
    const tileId = Object.keys(world.territory.tiles)[0];

    expect(getInspectorTarget(world, {
      selectedBuildingId: null,
      selectedWorkerId: workerId,
      selectedTileId: null,
    })).toEqual({ kind: 'worker', workerId });

    expect(getInspectorTarget(world, {
      selectedBuildingId: null,
      selectedWorkerId: null,
      selectedTileId: tileId,
    })).toEqual({ kind: 'tile', tileId });
  });
});
