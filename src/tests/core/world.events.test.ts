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
    const next = applyScheduledWorldEvents(makeWorld(125, { lastEventStep: 0, log: [] }));

    expect(next.events?.lastEventStep).toBe(1);
    expect(next.events?.log[0].title).toBe('Ashfall Blessing');
    expect(next.temporaryModifiers?.productionBoost).toBeGreaterThan(1);
  });

  it('applies later event effects without duplicating old events', () => {
    const world = makeWorld(365, { lastEventStep: 1, log: [{ id: 'event_1', age: 125, title: 'Ashfall Blessing', description: '', severity: 'info' }] });

    const next = applyScheduledWorldEvents(world);

    expect(next.events?.lastEventStep).toBe(3);
    expect(next.events?.log.map((event) => event.title)).toEqual(['Resource Drought', 'Road Congestion', 'Ashfall Blessing']);
    expect(next.transport.networkStress).toBe(8);
  });

  it('applies drought by reducing vault water and grain reserves', () => {
    const world = {
      ...makeWorld(365, { lastEventStep: 2, log: [] }),
      buildings: {
        vault: {
          id: 'vault',
          type: 'vaultOfDigestiveStone',
          ownerId: 'p1',
          outputBuffer: { amnioticWater: 5, marrowGrain: 2 },
        } as any,
      },
    };

    const next = applyScheduledWorldEvents(world);

    expect(next.events?.log[0].title).toBe('Resource Drought');
    expect(next.buildings.vault.outputBuffer.amnioticWater).toBe(2);
    expect(next.buildings.vault.outputBuffer.marrowGrain).toBe(0);
  });
});
