import { WorldEventLogEntry, WorldState } from '../world/world.types';

const EVENT_INTERVAL_SEC = 120;
const MAX_EVENT_LOG = 8;

type ScheduledEvent = {
  title: string;
  description: string;
  severity: WorldEventLogEntry['severity'];
  apply: (state: WorldState, step: number) => WorldState;
};

const EVENTS: ScheduledEvent[] = [
  {
    title: 'Ashfall Blessing',
    description: 'Production rites accelerate for a short interval.',
    severity: 'info',
    apply: (state) => ({
      ...state,
      temporaryModifiers: {
        ...state.temporaryModifiers,
        productionBoost: 1.1,
        expiresAtAge: state.ageOfTeeth + 35,
      },
    }),
  },
  {
    title: 'Road Congestion',
    description: 'The road network strains under freight pressure.',
    severity: 'warning',
    apply: (state) => ({
      ...state,
      transport: {
        ...state.transport,
        networkStress: Math.min(100, state.transport.networkStress + 8),
      },
    }),
  },
  {
    title: 'Resource Drought',
    description: 'Surface stores dry out; vault water and grain reserves are strained.',
    severity: 'warning',
    apply: (state) => {
      const buildings = { ...state.buildings };
      for (const building of Object.values(buildings)) {
        if (building.type !== 'vaultOfDigestiveStone') continue;
        buildings[building.id] = {
          ...building,
          outputBuffer: {
            ...building.outputBuffer,
            amnioticWater: Math.max(0, (building.outputBuffer.amnioticWater ?? 0) - 3),
            marrowGrain: Math.max(0, (building.outputBuffer.marrowGrain ?? 0) - 3),
          },
        };
      }
      return { ...state, buildings };
    },
  },
  {
    title: 'Morale Shock',
    description: 'Workers lose nerve and need idle time to recover.',
    severity: 'danger',
    apply: (state) => {
      const workers = { ...state.workers };
      for (const worker of Object.values(workers)) {
        workers[worker.id] = { ...worker, morale: Math.max(0, worker.morale - 8) };
      }
      return { ...state, workers };
    },
  },
];

export function applyScheduledWorldEvents(world: WorldState): WorldState {
  const previousStep = world.events?.lastEventStep ?? Math.floor(world.ageOfTeeth / EVENT_INTERVAL_SEC);
  const currentStep = Math.floor(world.ageOfTeeth / EVENT_INTERVAL_SEC);
  if (currentStep <= previousStep || currentStep <= 0) {
    return {
      ...world,
      events: world.events ?? { lastEventStep: previousStep, log: [] },
    };
  }

  let next = world;
  const log = [...(world.events?.log ?? [])];

  for (let step = previousStep + 1; step <= currentStep; step++) {
    const event = EVENTS[(step - 1) % EVENTS.length];
    next = event.apply(next, step);
    log.unshift({
      id: `event_${step}`,
      age: next.ageOfTeeth,
      title: event.title,
      description: event.description,
      severity: event.severity,
    });
  }

  return {
    ...next,
    events: {
      lastEventStep: currentStep,
      log: log.slice(0, MAX_EVENT_LOG),
    },
  };
}
