import { ResourceType, ResourceInventory } from "../core/economy.types";

export function getResourceAmount(
  inventory: ResourceInventory,
  type: ResourceType
): number {
  return inventory[type] ?? 0;
}

export function addResource(
  inventory: ResourceInventory,
  type: ResourceType,
  amount: number
): ResourceInventory {
  return {
    ...inventory,
    [type]: (inventory[type] ?? 0) + amount,
  };
}

export function removeResource(
  inventory: ResourceInventory,
  type: ResourceType,
  amount: number
): ResourceInventory {
  const current = inventory[type] ?? 0;

  if (current < amount) {
    throw new Error(
      `The Cathedral is unsatisfied: missing ${type} (need ${amount}, have ${current})`
    );
  }

  return {
    ...inventory,
    [type]: current - amount,
  };
}

export function hasEnoughResources(
  inventory: ResourceInventory,
  cost: Partial<Record<ResourceType, number>>
): boolean {
  return Object.entries(cost).every(([resource, amount]) => {
    const key = resource as ResourceType;
    return (inventory[key] ?? 0) >= (amount ?? 0);
  });
}

export function applyResourceDelta(
  inventory: ResourceInventory,
  delta: Partial<Record<ResourceType, number>>
): ResourceInventory {
  let next = { ...inventory };

  for (const [resource, amount] of Object.entries(delta)) {
    const key = resource as ResourceType;
    next[key] = (next[key] ?? 0) + (amount ?? 0);
    if ((next[key] ?? 0) < 0) {
      throw new Error(`Resource underflow for ${key}`);
    }
  }

  return next;
}
