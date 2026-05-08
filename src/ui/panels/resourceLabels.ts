import type { ResourceType } from '../../game/core/economy.types';

export function resourceShortLabel(resource: ResourceType): string {
  switch (resource) {
    case 'toothPlanks':
      return 'Planks';
    case 'sepulcherStone':
      return 'Stone';
    case 'marrowGrain':
      return 'Grain';
    case 'boneDust':
      return 'Dust';
    case 'amnioticWater':
      return 'Water';
    case 'eyelessFish':
      return 'Fish';
    case 'brainSalt':
      return 'Salt';
    case 'funeralLoaf':
      return 'Loaf';
    case 'graveCoal':
      return 'Coal';
    case 'veinIronOre':
      return 'Iron Ore';
    case 'veinIronBar':
      return 'Bars';
    case 'tormentInstrument':
      return 'Tools';
    case 'haloGoldBar':
      return 'Gold';
    case 'cathedralGoldOre':
      return 'Gold Ore';
    case 'sinewTimber':
      return 'Timber';
    default:
      return resource.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
  }
}
