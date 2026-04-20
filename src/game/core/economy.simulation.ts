import { OwnerId, BuildingId, WorkerId } from "./entity.ids";
import {
  PlayerState,
  BuildingInstance,
  WorkerInstance,
  TerritoryState,
  Position,
  MapTile,
} from "./game.types";
import { BuildingType } from "./economy.types";
import { TransportState } from "../economy/transport.logic";
import { BUILDING_DEFINITIONS } from "./economy.data";

export interface EconomySimulationState {
  tick: number;
  ageOfTeeth: number;
  players: Record<OwnerId, PlayerState>;
  buildings: Record<BuildingId, BuildingInstance>;
  workers: Record<WorkerId, WorkerInstance>;
  territory: TerritoryState;
  transport: TransportState;
  worldPulse: number;
}

export function createBuildingInstance(
  id: BuildingId,
  type: BuildingType,
  ownerId: OwnerId,
  position: Position
): BuildingInstance {
  return {
    id,
    type,
    ownerId,
    level: 1,
    integrity: 100,
    position,
    connectedToRoad: false,
    inputBuffer: {},
    outputBuffer: {},
    internalStorage: {},
    assignedWorkers: [],
    progressSec: 0,
    isActive: true,
    liturgy: "Consume. Convert. Continue.",
    corruption: 0,
  };
}

export function isTileBuildableForPlayer(
  tile: MapTile,
  playerId: OwnerId,
  buildingType: BuildingType
): boolean {
  const def = BUILDING_DEFINITIONS[buildingType];
  const isOwned = tile.ownerId === playerId;
  const terrainAllowed = def.allowedTerrain.includes(tile.terrain);
  const isFree = !tile.buildingId;

  return isOwned && terrainAllowed && isFree;
}
