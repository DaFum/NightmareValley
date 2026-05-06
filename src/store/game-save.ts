import { WorldState } from '../game/world/world.types';
import { GameScenarioProfile } from './game.store';

export const GAME_SAVE_VERSION = 1;
export const GAME_SAVE_STORAGE_KEY = 'nightmare-valley:save:v1';

export type GameSaveSnapshot = {
  version: typeof GAME_SAVE_VERSION;
  savedAt: string;
  scenario: GameScenarioProfile;
  tickRate: number;
  gameState: WorldState;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isScenario(value: unknown): value is GameScenarioProfile {
  return value === 'sandbox' || value === 'challenging' || value === 'hardcore';
}

function looksLikeWorldState(value: unknown): value is WorldState {
  if (!isRecord(value)) return false;
  return (
    typeof value.tick === 'number' &&
    typeof value.ageOfTeeth === 'number' &&
    isRecord(value.players) &&
    isRecord(value.buildings) &&
    isRecord(value.workers) &&
    isRecord(value.territory) &&
    isRecord(value.transport)
  );
}

function getStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function createGameSaveSnapshot(
  gameState: WorldState,
  scenario: GameScenarioProfile,
  tickRate: number,
  savedAt = new Date().toISOString()
): GameSaveSnapshot {
  return {
    version: GAME_SAVE_VERSION,
    savedAt,
    scenario,
    tickRate,
    gameState,
  };
}

export function serializeGameSave(snapshot: GameSaveSnapshot): string {
  return JSON.stringify(snapshot);
}

export function parseGameSave(raw: string | null): GameSaveSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    if (parsed.version !== GAME_SAVE_VERSION) return null;
    if (typeof parsed.savedAt !== 'string') return null;
    if (!isScenario(parsed.scenario)) return null;
    if (typeof parsed.tickRate !== 'number' || !Number.isFinite(parsed.tickRate)) return null;
    if (!looksLikeWorldState(parsed.gameState)) return null;

    return parsed as GameSaveSnapshot;
  } catch {
    return null;
  }
}

export function writeGameSave(snapshot: GameSaveSnapshot, storage: StorageLike | null = getStorage()): boolean {
  if (!storage) return false;

  try {
    storage.setItem(GAME_SAVE_STORAGE_KEY, serializeGameSave(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function readGameSave(storage: StorageLike | null = getStorage()): GameSaveSnapshot | null {
  if (!storage) return null;
  try {
    return parseGameSave(storage.getItem(GAME_SAVE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function deleteGameSave(storage: StorageLike | null = getStorage()): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(GAME_SAVE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasGameSave(storage: StorageLike | null = getStorage()): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(GAME_SAVE_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
