import {
  createGameSaveSnapshot,
  deleteGameSave,
  GAME_SAVE_STORAGE_KEY,
  hasGameSave,
  parseGameSave,
  readGameSave,
  writeGameSave,
} from '../../store/game-save';
import { WorldState } from '../../game/world/world.types';

function makeWorldState(): WorldState {
  return {
    tick: 42,
    ageOfTeeth: 21,
    seed: 7,
    lastDeltaSec: 0.5,
    scenarioProfile: 'challenging',
    players: {},
    buildings: {},
    workers: {},
    territory: { tiles: {}, tileIndex: {} },
    transport: {
      jobs: {},
      activeCarrierTasks: {},
      networkStress: 0,
      averageLatencySec: 0,
      queuedJobCount: 0,
    },
    worldPulse: 0,
  };
}

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      values.delete(key);
    }),
  };
}

describe('game-save', () => {
  it('round-trips a versioned game save snapshot', () => {
    const snapshot = createGameSaveSnapshot(makeWorldState(), 'challenging', 2, '2026-04-28T10:00:00.000Z');
    const parsed = parseGameSave(JSON.stringify(snapshot));

    expect(parsed?.version).toBe(1);
    expect(parsed?.scenario).toBe('challenging');
    expect(parsed?.tickRate).toBe(2);
    expect(parsed?.gameState.tick).toBe(42);
  });

  it('rejects invalid, incompatible, or incomplete save data', () => {
    expect(parseGameSave(null)).toBeNull();
    expect(parseGameSave('{broken')).toBeNull();
    expect(parseGameSave(JSON.stringify({ version: 999 }))).toBeNull();
    expect(parseGameSave(JSON.stringify({ version: 1, savedAt: 'x', scenario: 'bad', tickRate: 1, gameState: makeWorldState() }))).toBeNull();
    expect(parseGameSave(JSON.stringify({ version: 1, savedAt: 'x', scenario: 'sandbox', tickRate: Number.NaN, gameState: makeWorldState() }))).toBeNull();
  });

  it('writes, reads, detects, and deletes saves through storage', () => {
    const storage = createMemoryStorage();
    const snapshot = createGameSaveSnapshot(makeWorldState(), 'sandbox', 5, '2026-04-28T11:00:00.000Z');

    expect(hasGameSave(storage)).toBe(false);
    expect(writeGameSave(snapshot, storage)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(GAME_SAVE_STORAGE_KEY, expect.any(String));
    expect(hasGameSave(storage)).toBe(true);
    expect(readGameSave(storage)?.scenario).toBe('sandbox');
    expect(deleteGameSave(storage)).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledWith(GAME_SAVE_STORAGE_KEY);
    expect(readGameSave(storage)).toBeNull();
  });
});
