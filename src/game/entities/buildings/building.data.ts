import { BUILDING_DEFINITIONS } from '../../core/economy.data';

import { BuildingDefinition, BuildingType } from '../../core/economy.types';

export function getBuildingDefinition(typeOrBuilding: string | { type: string } | null | undefined): BuildingDefinition | null {
	if (typeOrBuilding === null || typeOrBuilding === undefined) return null;
	const t = typeof typeOrBuilding === 'string' ? typeOrBuilding : typeOrBuilding.type;
	return BUILDING_DEFINITIONS[t as BuildingType] || null;
}

export function listBuildings() {
	return Object.values(BUILDING_DEFINITIONS);
}


