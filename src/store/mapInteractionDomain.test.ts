import { useGameStore } from './game.store';
import { getIsoWorldBoundsForTerritory, getMapFootprint, resolvePointerToTile } from './mapInteractionDomain';

describe('mapInteractionDomain', () => {
  it('resolves pointer through iso->map pipeline helpers', () => {
    const state = useGameStore.getState().gameState;
    const resolved = resolvePointerToTile(state, 0, 0, 0, 0, 1);
    expect(resolved).toBeTruthy();
    expect(resolved?.tile).toBeTruthy();
    expect(resolved?.chunk.id).toContain('_');
  });

  it('exposes footprint and world bounds wrappers', () => {
    const state = useGameStore.getState().gameState;
    const footprint = getMapFootprint(2, 2, 1, 1);
    expect(footprint.tiles.length).toBe(4);
    const bounds = getIsoWorldBoundsForTerritory(state);
    expect(bounds.maxX).toBeGreaterThan(bounds.minX);
  });
});
