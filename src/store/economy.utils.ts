import type { ResourceType } from '../game/core/economy.types';

export function resourceLabel(resource: ResourceType | string): string {
  return resource.replace(/(?!^)([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}
