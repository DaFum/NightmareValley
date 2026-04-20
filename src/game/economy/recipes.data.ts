import { ProductionRecipe } from "./recipes.types";

export const RECIPES: Record<string, ProductionRecipe> = {
  rendSinewTimber: {
    id: "rendSinewTimber",
    name: "Rend Sinew Timber into Tooth Planks",
    inputs: { sinewTimber: 1 },
    outputs: { toothPlanks: 1 },
    workTimeSec: 8,
    description: "The grain shrieks along the saw.",
  },

  grindMarrowGrain: {
    id: "grindMarrowGrain",
    name: "Grind Marrow Grain into Bone Dust",
    inputs: { marrowGrain: 1 },
    outputs: { boneDust: 1 },
    workTimeSec: 8,
    description: "Meal for the obedient.",
  },

  bakeFuneralLoaf: {
    id: "bakeFuneralLoaf",
    name: "Bake Funeral Loaf",
    inputs: { boneDust: 1, amnioticWater: 1 },
    outputs: { funeralLoaf: 1 },
    workTimeSec: 10,
    description: "Dense, grey, warm, and spiritually insulting.",
  },

  flensePigMass: {
    id: "flensePigMass",
    name: "Flense Pig Flesh Mass into Meat",
    inputs: { pigFleshMass: 1 },
    outputs: { flensedMeat: 1, saintFat: 1 },
    workTimeSec: 12,
    description: "Nothing is wasted except mercy.",
  },

  smeltVeinIron: {
    id: "smeltVeinIron",
    name: "Smelt Vein Iron",
    inputs: { veinIronOre: 1, graveCoal: 1 },
    outputs: { veinIronBar: 1, lungAsh: 1 },
    workTimeSec: 12,
    description: "Metal emerges red and doctrinal.",
  },

  meltHaloGold: {
    id: "meltHaloGold",
    name: "Melt Halo Gold",
    inputs: { cathedralGoldOre: 1, graveCoal: 1 },
    outputs: { haloGoldBar: 1, lungAsh: 1 },
    workTimeSec: 12,
    description: "Luxury made from subterranean blasphemy.",
  },

  forgeTormentInstrument: {
    id: "forgeTormentInstrument",
    name: "Forge Torment Instrument",
    inputs: { veinIronBar: 1 },
    outputs: { tormentInstrument: 1 },
    workTimeSec: 14,
    description: "The tool that creates the worker that creates the state.",
  },

  forgeRibBlade: {
    id: "forgeRibBlade",
    name: "Forge Rib Blade",
    inputs: { veinIronBar: 1 },
    outputs: { ribBlade: 1 },
    workTimeSec: 14,
    description: "Sharp enough to negotiate borders.",
  },

  stitchSkinWall: {
    id: "stitchSkinWall",
    name: "Stitch Skin Wall",
    inputs: { toothPlanks: 1, saintFat: 1 },
    outputs: { skinWall: 1 },
    workTimeSec: 12,
    description: "Flexible, fragrant, defensive.",
  },

  refineBrainSalt: {
    id: "refineBrainSalt",
    name: "Refine Brain Salt",
    inputs: { eyelessFish: 1 },
    outputs: { brainSalt: 1 },
    workTimeSec: 10,
    description: "Preservation by reduction.",
  },

  renderSaintFat: {
    id: "renderSaintFat",
    name: "Render Saint Fat",
    inputs: { saintFat: 1 },
    outputs: { saintFat: 2 },
    workTimeSec: 10,
    description: "This should not be thermodynamically possible, but faith helps.",
  },

  compressAsh: {
    id: "compressAsh",
    name: "Compress Lung Ash",
    inputs: { lungAsh: 2 },
    outputs: { graveCoal: 1 },
    workTimeSec: 16,
    description: "The economy learns to eat its own soot.",
  },
};
