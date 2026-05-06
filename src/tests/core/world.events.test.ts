import { applyScheduledWorldEvents } from '../../game/events/events.logic';
import { WorldState } from '../../game/world/world.types';

function makeWorld(ageOfTeeth: number, events?: WorldState['events']): WorldState {
  return {
    tick: 0,
    ageOfTeeth,
    seed: 1,
    lastDeltaSec: 1,
    players: {},
    buildings: {},
    workers: {
      w1: {
        id: 'w1',
        type: 'burdenThrall',
        ownerId: 'p1',
        position: { x: 0, y: 0 },
        isIdle: true,
        morale: 100,
        infection: 0,
        scars: 0,
      },
    },
    territory: { tiles: {}, tileIndex: {} },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
    events,
  };
}

describe('applyScheduledWorldEvents', () => {
  it('does not emit events before the first interval', () => {
    const next = applyScheduledWorldEvents(makeWorld(60));

    expect(next.events?.log).toEqual([]);
  });

  it('emits deterministic events when crossing event intervals', () => {
    const world = makeWorld(125, { lastEventStep: 0, log: [] });
    world.seed = 2; // seed=2, step=1 -> Ashfall Blessing
    const next = applyScheduledWorldEvents(world);

    expect(next.events?.lastEventStep).toBe(1);
    expect(next.events?.log[0].title).toBe('Ashfall Blessing');
    expect(next.temporaryModifiers?.productionBoost).toBeGreaterThan(1);
  });

  it('applies later event effects without duplicating old events', () => {
    const world = makeWorld(365, { lastEventStep: 1, log: [{ id: 'event_1', age: 125, title: 'Ashfall Blessing', description: '', severity: 'info' }] });
    world.seed = 3; // For step 2 and 3, Random(3 * 1000 + step) -> step 2 is Road Congestion, step 3 is Morale Shock

    const next = applyScheduledWorldEvents(world);

    expect(next.events?.lastEventStep).toBe(3);
    expect(next.events?.log.map((event) => event.title)).toEqual(['Morale Shock', 'Road Congestion', 'Ashfall Blessing']);
    expect(next.workers.w1.morale).toBe(92); // 100 - 8 from Morale Shock
    expect(next.transport.networkStress).toBe(8); // from Road Congestion
  });

  it('applies drought by reducing vault water and grain reserves', () => {
    const world = {
      ...makeWorld(365, { lastEventStep: 1, log: [] }),
      seed: 1, // seed=1, step=2 produces 'Ashfall Blessing', step 3 produces 'Resource Drought'.
    };
    world.buildings = {
        vault: {
          id: 'vault',
          type: 'vaultOfDigestiveStone',
          ownerId: 'p1',
          outputBuffer: { amnioticWater: 5, marrowGrain: 2 },
        } as any,
    };
    world.ageOfTeeth = 365; // evaluates step 2 and step 3

    const next = applyScheduledWorldEvents(world);

    expect(next.events?.log[0].title).toBe('Resource Drought'); // since step 3 was drought, and unshift puts it first
    expect(next.buildings.vault.outputBuffer.amnioticWater).toBe(2);
    expect(next.buildings.vault.outputBuffer.marrowGrain).toBe(0);
  });
});
