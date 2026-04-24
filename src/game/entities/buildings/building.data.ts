import { BUILDING_DEFINITIONS } from '../../core/economy.data';

import { BuildingDefinition } from '../../core/economy.types';
import { BuildingType } from '../../core/economy.types';

export function getBuildingDefinition(typeOrBuilding: string | { type: string }): BuildingDefinition | null {
	const t = typeof typeOrBuilding === 'string' ? typeOrBuilding : typeOrBuilding.type;
	return BUILDING_DEFINITIONS[t as BuildingType] || null;
}

export function listBuildings() {
	return Object.values(BUILDING_DEFINITIONS);
}


