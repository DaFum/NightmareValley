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
  /**
   * Siedler-2 style delivery controls.
   * deliveryPriority: 1 (low) – 5 (high), default 3.
   * pausedInputs: resources whose delivery to this building is suspended.
   */
  deliveryPriority?: number;
  pausedInputs?: Partial<Record<ResourceType, boolean>>;
  autoHire?: Partial<Record<WorkerType, boolean>>;
}

export interface WorkerInstance {
  id: WorkerId;
  type: WorkerType;
  ownerId: OwnerId;
  homeBuildingId?: BuildingId;
  currentBuildingId?: BuildingId;
  currentJob?: Job;
  position: Position;
  isIdle: boolean;
  morale: number;
  infection: number;
  scars: number;
  path?: Position[];
}

export interface Job<T = unknown> {
  id: string;
  type: string;
  target?: T;
}

export type TileTier = "grass" | "dirt" | "cobble" | "paved";

export interface MapTile {
  id: TileId;
  position: Position;
  terrain: TerrainType;
  ownerId?: OwnerId;
  buildingId?: BuildingId;
  fertility?: number;
  corruption?: number;
  resourceDeposit?: Partial<Record<ResourceType, number>>;
  footfall: number;
  tier: TileTier;
}

/**
 * Any code that inserts, removes or relocates entries in `tiles` (e.g., functions
 * that call getTileAt or mutate MapTile positions) must also update `tileIndex`
 * to avoid stale lookups. `tileIndex` is derived and must be kept coherent.
 */
export interface TerritoryState {
  tiles: Record<TileId, MapTile>;
  tileIndex?: Record<string, TileId>;
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
