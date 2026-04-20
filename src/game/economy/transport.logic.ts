import { BuildingId, WorkerId } from "../core/entity.ids";
import { Position } from "../core/game.types";
import { ResourceType } from "../core/economy.types";

export interface RoadNode {
  id: string;
  position: Position;
  connectedNodeIds: string[];
  pressure?: number;
}

export interface TransportJob {
  id: string;
  fromBuildingId: BuildingId;
  toBuildingId: BuildingId;
  resourceType: ResourceType;
  amount: number;
  priority: number;
  reserved: number;
  delivered: number;
  status: "queued" | "claimed" | "delivered" | "spilled" | "lost";
  description?: string;
}

export interface CarrierTask {
  workerId: WorkerId;
  jobId: string;
  pickupBuildingId: BuildingId;
  dropoffBuildingId: BuildingId;
  resourceType: ResourceType;
  amount: number;
  progress: number;
}

export interface TransportState {
  roadNodes: Record<string, RoadNode>;
  jobs: Record<string, TransportJob>;
  activeCarrierTasks: Record<string, CarrierTask>;
  networkStress: number;
  averageLatencySec: number;
}
