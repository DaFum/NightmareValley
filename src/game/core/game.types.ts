import { OwnerId, BuildingId, WorkerId, TileId } from "./entity.ids";
import {
  BuildingType,
  ResourceType,
  ResourceInventory,
  WorkerType,
  TerrainType,
} from "./economy.types";

export interface Position {
  x: number;
  y: number;
}

export interface BuildingInstance {
  id: BuildingId;
  type: BuildingType;
  ownerId: OwnerId;
  level: number;
  integrity: number;
  position: Position;
  connectedToRoad: boolean;
  inputBuffer: ResourceInventory;
  outputBuffer: ResourceInventory;
  internalStorage: ResourceInventory;
  assignedWorkers: WorkerId[];
  currentRecipeId?: string;
  progressSec: number;
  isActive: boolean;
  constructionProgress?: number;
  liturgy?: string;
  corruption?: number;
}

export interface WorkerInstance {
  id: WorkerId;
  type: WorkerType;
  ownerId: OwnerId;
  homeBuildingId?: BuildingId;
  currentBuildingId?: BuildingId;
  position: Position;
  isIdle: boolean;
  morale: number;
  infection: number;
  scars: number;
}

export interface MapTile {
  id: TileId;
  position: Position;
  terrain: TerrainType;
  ownerId?: OwnerId;
  buildingId?: BuildingId;
  roadNodeId?: string;
  fertility?: number;
  corruption?: number;
  resourceDeposit?: Partial<Record<ResourceType, number>>;
}

export interface TerritoryState {
  tiles: Record<TileId, MapTile>;
}

export type DoctrineType =
  | "consumption"
  | "industry"
  | "war"
  | "preservation"
  | "gold"
  | "transcendence";

export interface PlayerState {
  id: OwnerId;
  name: string;
  stock: ResourceInventory;
  buildings: BuildingId[];
  workers: WorkerId[];
  territoryTileIds: TileId[];
  populationLimit: number;
  doctrine: DoctrineType;
  dread: number;
  holinessDebt: number;
}
