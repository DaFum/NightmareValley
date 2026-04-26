export type ResourceType =
  | "sinewTimber"
  | "toothPlanks"
  | "sepulcherStone"
  | "amnioticWater"
  | "eyelessFish"
  | "marrowGrain"
  | "boneDust"
  | "funeralLoaf"
  | "pigFleshMass"
  | "flensedMeat"
  | "graveCoal"
  | "veinIronOre"
  | "cathedralGoldOre"
  | "veinIronBar"
  | "haloGoldBar"
  | "tormentInstrument"
  | "ribBlade"
  | "skinWall"
  | "brainSalt"
  | "saintFat"
  | "lungAsh";

export type BuildingType =
  | "organHarvester"
  | "seedOfTheHowlingRoot"
  | "millOfGnashing"
  | "sepulcherQuarry"
  | "wombWell"
  | "shoreOfHooks"
  | "fieldOfMouths"
  | "dustCathedralMill"
  | "ovenOfLastBread"
  | "styOfConsumption"
  | "houseOfFlensing"
  | "coalWound"
  | "ironVeinPit"
  | "goldCatacomb"
  | "bloodSmeltery"
  | "haloLiquefier"
  | "instrumentCrucible"
  | "bladeVestry"
  | "skinStitchery"
  | "vaultOfDigestiveStone"
  | "pitOfWarBirth"
  | "spireOfJurisdiction"
  | "refectoryOfSalt"
  | "fatRenderer"
  | "ashPress";

export type WorkerType =
  | "burdenThrall"
  | "fleshMason"
  | "timberExecutioner"
  | "rootCantor"
  | "gnashSawyer"
  | "graveToothBreaker"
  | "wellSupplicant"
  | "hookFisher"
  | "mouthFarmer"
  | "dustMiller"
  | "ovenAcolyte"
  | "styKeeper"
  | "flenser"
  | "deepVeinMiner"
  | "smelterMonk"
  | "painArtisan"
  | "warInfant"
  | "saltPriest"
  | "fatBoiler"
  | "ashCollector";

export type TerrainType =
  | "scarredEarth"
  | "weepingForest"
  | "ribMountain"
  | "placentaLake"
  | "scarPath"
  | "occupiedScar"
  | "ashBog"
  | "cathedralRock";

export interface ResourceStack {
  type: ResourceType;
  amount: number;
}

export type ResourceInventory = Partial<Record<ResourceType, number>>;

export interface BuildingCost {
  resources: Partial<Record<ResourceType, number>>;
}

export interface ExtractionRule {
  resource: ResourceType;
  amountPerCycle: number;
  cycleTimeSec: number;
}

export interface BuildingDefinition {
  type: BuildingType;
  name: string;
  maxLevel: number;
  buildCost: BuildingCost;
  upgradeCosts: BuildingCost[];
  workerSlots: Partial<Record<WorkerType, number>>;
  recipeIds?: string[];
  allowedTerrain: TerrainType[];
  requiresRoadConnection: boolean;
  territoryInfluence?: number;
  extraction?: ExtractionRule;
  inputPriority?: ResourceType[];
  outputPriority?: ResourceType[];
  description: string;
  widthTiles?: number;
  heightTiles?: number;
  constructionTime?: number;
}

export interface WorkerDefinition {
  type: WorkerType;
  name: string;
  moveSpeed: number;
  canCarry: boolean;
  carryCapacity: number;
  description: string;
}
