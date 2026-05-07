import { mapEconomyStateToIsoWorld } from '../../game/render/render.adapter';
import { EconomySimulationState } from '../../game/core/economy.simulation';

function makeState(): EconomySimulationState {
  return {
    tick: 0,
    ageOfTeeth: 0,
    players: {},
    buildings: {},
    workers: {},
    territory: {
      tiles: {
        tile_0_0: {
          id: 'tile_0_0',
          position: { x: 0, y: 0 },
          terrain: 'scarredEarth',
          ownerId: 'player',
          footfall: 0,
          tier: 'grass',
        },
      },
      tileIndex: { '0,0': 'tile_0_0' },
    },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  };
}

describe('render adapter', () => {
  it('includes ownership metadata for territory rendering', () => {
    const world = mapEconomyStateToIsoWorld(makeState());

    expect(world.tiles[0].ownerId).toBe('player');
    expect(world.tiles[0].terrain).toBe('scarredEarth');
  });
});
