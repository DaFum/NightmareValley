import { BUILDING_DEFINITIONS } from '../../core/economy.data';

export function getBuildingDefinition(type: string) {
	return (BUILDING_DEFINITIONS as any)[type] || null;
}

export function listBuildings() {
	return Object.values(BUILDING_DEFINITIONS);
}


