import type { BuildingInstance } from '../game/core/game.types';
import type { WorldState } from '../game/world/world.types';
import { getWorkerDefinition } from '../game/core/economy.data';
import { DEFAULT_SIMULATION_CONFIG } from '../game/economy/balancing.constants';
import { gridManhattanDistance } from '../game/transport';

export type BuildingRoadDetails = {
  status: 'Connected' | 'Not connected';
  connectedNetwork: string;
  distanceToNearestVault: number | null;
  roadDistanceTiles: number | null;
  estimatedDeliverySec: number | null;
  warning: string | null;
};

function estimateDeliverySeconds(distance: number): number {
  const carrierSpeed = DEFAULT_SIMULATION_CONFIG.carrierBaseSpeed * (getWorkerDefinition('burdenThrall')?.moveSpeed ?? 1);
  return Math.round(distance / Math.max(0.0001, carrierSpeed));
}

export function getBuildingRoadDetails(
  state: WorldState,
  ownerId: string,
  building: BuildingInstance | null | undefined,
): BuildingRoadDetails {
  if (!building) {
    return {
      status: 'Not connected',
      connectedNetwork: 'No selected building',
      distanceToNearestVault: null,
      roadDistanceTiles: null,
      estimatedDeliverySec: null,
      warning: null,
    };
  }

  const vaults = Object.values(state.buildings ?? {}).filter(
    (candidate) => candidate.ownerId === ownerId && candidate.type === 'vaultOfDigestiveStone',
  );
  const nearestVault = vaults
    .filter((vault) => vault.id !== building.id)
    .map((vault) => ({
      vault,
      distance: gridManhattanDistance(building.position, vault.position),
    }))
    .sort((a, b) => a.distance - b.distance)[0] ?? null;

  const distance = building.type === 'vaultOfDigestiveStone'
    ? 0
    : nearestVault?.distance ?? null;
  const estimatedDeliverySec = distance == null ? null : estimateDeliverySeconds(distance);
  const status = building.connectedToRoad ? 'Connected' : 'Not connected';
  const warning = !building.connectedToRoad
    ? 'Missing road connection: carriers cannot deliver here.'
    : distance != null && distance >= 18
      ? 'Connected but far: delivery time is high. Consider a shorter road or intermediate storage.'
      : null;

  return {
    status,
    connectedNetwork: building.type === 'vaultOfDigestiveStone'
      ? 'Vault network hub'
      : nearestVault
        ? `Nearest vault: ${nearestVault.vault.id}`
        : 'No vault found',
    distanceToNearestVault: distance,
    roadDistanceTiles: distance,
    estimatedDeliverySec,
    warning,
  };
}
