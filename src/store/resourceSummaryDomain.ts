import type { ResourceInventory, ResourceType } from '../game/core/economy.types';
import type { WorldState } from '../game/world/world.types';

export type ResourceLedgerEntry = {
  available: number;
  reserved: number;
  inTransit: number;
  inInputBuffers: number;
  inOutputBuffers: number;
  blocked: number;
};

export type ResourceLedger = Record<ResourceType, ResourceLedgerEntry>;

export const RESOURCE_TYPES: ResourceType[] = [
  'sinewTimber',
  'toothPlanks',
  'sepulcherStone',
  'amnioticWater',
  'eyelessFish',
  'marrowGrain',
  'boneDust',
  'funeralLoaf',
  'pigFleshMass',
  'flensedMeat',
  'graveCoal',
  'veinIronOre',
  'cathedralGoldOre',
  'veinIronBar',
  'haloGoldBar',
  'tormentInstrument',
  'ribBlade',
  'skinWall',
  'brainSalt',
  'saintFat',
  'lungAsh',
];

const ACTIVE_JOB_STATUSES = new Set(['queued', 'claimed']);

function emptyEntry(): ResourceLedgerEntry {
  return {
    available: 0,
    reserved: 0,
    inTransit: 0,
    inInputBuffers: 0,
    inOutputBuffers: 0,
    blocked: 0,
  };
}

function addInventory(
  ledger: ResourceLedger,
  key: keyof ResourceLedgerEntry,
  inventory: ResourceInventory,
) {
  for (const [resource, amount] of Object.entries(inventory)) {
    const resourceType = resource as ResourceType;
    if (ledger[resourceType]) {
      ledger[resourceType][key] += amount ?? 0;
    }
  }
}

export function createEmptyResourceLedger(): ResourceLedger {
  return Object.fromEntries(RESOURCE_TYPES.map((resource) => [resource, emptyEntry()])) as ResourceLedger;
}

export function getResourceLedger(state: WorldState, ownerId: string): ResourceLedger {
  const ledger = createEmptyResourceLedger();
  const vaultOutput: Partial<Record<ResourceType, number>> = {};

  for (const building of Object.values(state.buildings ?? {})) {
    if (building.ownerId !== ownerId) continue;
    addInventory(ledger, 'inInputBuffers', building.inputBuffer ?? {});
    addInventory(ledger, 'inOutputBuffers', building.outputBuffer ?? {});

    if (building.type === 'vaultOfDigestiveStone') {
      for (const [resource, amount] of Object.entries(building.outputBuffer ?? {})) {
        const resourceType = resource as ResourceType;
        vaultOutput[resourceType] = (vaultOutput[resourceType] ?? 0) + (amount ?? 0);
      }
    }
  }

  for (const job of Object.values(state.transport?.jobs ?? {})) {
    if (!ACTIVE_JOB_STATUSES.has(job.status)) continue;
    const source = state.buildings[job.fromBuildingId];
    if (source?.ownerId !== ownerId) continue;
    if (ledger[job.resourceType]) {
      const reserved = job.status === 'queued' ? job.amount : Math.max(job.reserved, job.amount - job.delivered);
      ledger[job.resourceType].reserved += Math.max(0, reserved);
    }
  }

  for (const task of Object.values(state.transport?.activeCarrierTasks ?? {})) {
    const target = state.buildings[task.dropoffBuildingId];
    if (target?.ownerId !== ownerId) continue;
    if (task.phase === 'toDropoff' && ledger[task.resourceType]) {
      ledger[task.resourceType].inTransit += task.amount;
    }
  }

  for (const resource of RESOURCE_TYPES) {
    ledger[resource].available = Math.max(0, (vaultOutput[resource] ?? 0) - ledger[resource].reserved);
  }

  return ledger;
}
