import { ResourceType } from "../core/economy.types";

export interface ProductionRecipe {
  id: string;
  name: string;
  inputs: Partial<Record<ResourceType, number>>;
  outputs: Partial<Record<ResourceType, number>>;
  workTimeSec: number;
  description: string;
}
