import { EconomySimulationState } from "../core/economy.simulation";
import { IsoRenderWorld } from "./render.types";
import { tileToScreen } from "../iso/iso.project";
import { getEntityZIndex } from "../iso/iso.depth";
import { getBuildingDefinition } from "../core/economy.data";
import { RECIPES } from "../economy/recipes.data";
import { DEFAULT_SIMULATION_CONFIG } from "../economy/balancing.constants";

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

// Simple deterministic hash to get variants based on id
function hashStringToInt(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
}

export function mapTerrainToIsoTiles(
  state: Pick<EconomySimulationState, "territory">
): IsoRenderWorld["tiles"] {
  const tiles: IsoRenderWorld["tiles"] = [];

  for (const [tileId, mapTile] of Object.entries(state.territory.tiles)) {
    const { x: sx, y: sy } = tileToScreen(
      mapTile.position.x,
      mapTile.position.y,
      TILE_WIDTH,
      TILE_HEIGHT
    );

    const variant = (hashStringToInt(tileId) % 4) + 1; // 4 variants (_1 .. _4)
    tiles.push({
      id: tileId,
      screenX: sx,
      screenY: sy,
      textureKey: `terrain_${mapTile.terrain}_${variant}`,
      chunkId: "0,0", // simplified
      resourceDeposit: mapTile.resourceDeposit,
      footfall: mapTile.footfall,
      tier: mapTile.tier,
    });
  }

  return tiles;
}

export function mapBuildingsToIsoBuildings(
  state: Pick<EconomySimulationState, "buildings">
): IsoRenderWorld["buildings"] {
  const buildings: IsoRenderWorld["buildings"] = [];

  for (const building of Object.values(state.buildings)) {
    const { x: sx, y: sy } = tileToScreen(
      building.position.x,
      building.position.y,
      TILE_WIDTH,
      TILE_HEIGHT
    );

    const footY = sy + TILE_HEIGHT / 2;
    const variant = (hashStringToInt(building.id) % 3) + 1; // 3 variants

    // Determine state
    let renderState: IsoRenderWorld["buildings"][0]["state"] = "idle";
    const statusIcons: string[] = [];
    const effectFlags: string[] = [];

    if (!building.isActive) {
      renderState = "disabled";
    } else if (building.progressSec > 0) {
      renderState = "working";
      effectFlags.push("smoke", "fire");
    } else if (building.corruption && building.corruption > 50) {
        renderState = "damaged";
    } else {
      const def = getBuildingDefinition(building);
      if (def.recipeIds && def.recipeIds.length > 0) {
        const activeRecipeId = building.currentRecipeId || def.recipeIds[0];
        const activeRecipe = activeRecipeId ? RECIPES[activeRecipeId] : undefined;

        if (activeRecipe && activeRecipe.inputs) {
          for (const [resType, requiredAmt] of Object.entries(activeRecipe.inputs)) {
            if ((requiredAmt as number) > 0) {
              const currentAmt = building.inputBuffer[resType as keyof typeof building.inputBuffer] ?? 0;
              if (Number(currentAmt) < Number(requiredAmt)) {
                renderState = "waitingForInput";
                statusIcons.push("missing_input");
                break;
              }
            }
          }
        }
      }
    }

    const buildStage = building.level >= 1 ? 4 : (Math.max(0, Math.min(4, Math.floor(Math.max(0, Math.min(1, building.constructionProgress || 0)) * 4))) as 0|1|2|3|4);

    // Building textures are registered in the manifest/loader using the key
    // pattern `buildings_stage${buildStage}_${type}`. This is a breaking change
    // from the older `building_${type}` format: `buildings` matches the manifest
    // collection/prefix, `stage${buildStage}` selects the construction/upgrade
    // sprite variant, and `${building.type}` must match the building type entry
    // used by the asset manifest (for example `buildings_stage4_organHarvester`).
    // Keep this string format aligned with the manifest structure so renderer
    // lookups resolve the same keys that the texture loader registers.
    const spriteKey = `buildings_stage${buildStage}_${building.type}`;

    buildings.push({
      id: building.id,
      type: building.type,
      tileX: building.position.x,
      tileY: building.position.y,
      widthTiles: 1, // default
      heightTiles: 1, // default
      originTileX: building.position.x,
      originTileY: building.position.y,
      screenX: sx,
      screenY: sy,
      footX: sx,
      footY: footY,
      zIndex: getEntityZIndex({ footX: sx, footY: footY }),
      spriteKey,
      variant,
      buildStage,
      state: renderState,
      selected: false,
      hovered: false,
      statusIcons,
      effectFlags,
      inputFill: Math.max(0, Math.min(1, Math.max(...Object.values(building.inputBuffer).map(val => (val ?? 0) / DEFAULT_SIMULATION_CONFIG.buildingInputBufferLimit), 0))),
      outputFill: Math.max(0, Math.min(1, Math.max(...Object.values(building.outputBuffer).map(val => {
        const limit = building.type === 'vaultOfDigestiveStone'
          ? DEFAULT_SIMULATION_CONFIG.warehouseStorageLimit
          : DEFAULT_SIMULATION_CONFIG.buildingOutputBufferLimit;
        return (val ?? 0) / limit;
      }), 0))),
    });
  }

  return buildings;
}

export function mapWorkersToIsoWorkers(
  state: Pick<EconomySimulationState, "workers" | "transport" | "buildings">
): IsoRenderWorld["workers"] {
  const workers: IsoRenderWorld["workers"] = [];

  for (const worker of Object.values(state.workers)) {
    const activeTask = state.transport.activeCarrierTasks[worker.id];
    let renderX = worker.position.x;
    let renderY = worker.position.y;

    if (activeTask && activeTask.path && activeTask.path.length > 1 && activeTask.pathIndex + 1 < activeTask.path.length) {
      const p1 = activeTask.path[activeTask.pathIndex];
      const p2 = activeTask.path[activeTask.pathIndex + 1];
      const prog = activeTask.stepProgress;
      renderX = p1.x + (p2.x - p1.x) * prog;
      renderY = p1.y + (p2.y - p1.y) * prog;
    }

    const { x: sx, y: sy } = tileToScreen(
      renderX,
      renderY,
      TILE_WIDTH,
      TILE_HEIGHT
    );

    const footY = sy + TILE_HEIGHT / 2;
    const variant = (hashStringToInt(worker.id) % 3) + 1;

    let dir: "NE" | "NW" | "SE" | "SW" = "SE";
    let renderState: IsoRenderWorld["workers"][0]["state"] = "idle";
    let animation: IsoRenderWorld["workers"][0]["animation"] = "idle";
    let carrying: string | undefined = undefined;

    if (activeTask) {
      if (activeTask.phase === "toPickup") {
        renderState = "walking";
        animation = "walk";
        carrying = undefined;
      } else {
        renderState = "carrying";
        animation = "carry";
        carrying = activeTask.resourceType;
      }

      const targetBuildingId = activeTask.phase === "toPickup" ? activeTask.pickupBuildingId : activeTask.dropoffBuildingId;
      const targetBuilding = state.buildings[targetBuildingId];

      if (targetBuilding) {
        const dx = targetBuilding.position.x - renderX;
        const dy = targetBuilding.position.y - renderY;
        if (dx > 0 && dy >= 0) dir = "SE";
        else if (dx <= 0 && dy > 0) dir = "SW";
        else if (dx < 0 && dy <= 0) dir = "NW";
        else if (dx >= 0 && dy < 0) dir = "NE";
      }
    } else if (!worker.isIdle) {
      renderState = "working";
      animation = "work";
    }

    let tool: string | undefined;
    if (worker.type === "timberExecutioner") tool = "axe";
    if (worker.type === "fleshMason") tool = "hammer";
    if (worker.type === "graveToothBreaker") tool = "pickaxe";

    workers.push({
      id: worker.id,
      type: worker.type,
      worldX: worker.position.x,
      worldY: worker.position.y,
      prevWorldX: worker.position.x, // Need historic data in simulation for true interp
      prevWorldY: worker.position.y,
      screenX: sx,
      screenY: sy,
      footX: sx,
      footY: footY,
      zIndex: getEntityZIndex({ footX: sx, footY: footY }),
      dir,
      animation,
      carrying,
      tool,
      selected: false,
      hovered: false,
      state: renderState,
      variant,
    });
  }

  return workers;
}

export function mapEconomyStateToIsoWorld(
  state: EconomySimulationState
): IsoRenderWorld {
  return {
    tiles: mapTerrainToIsoTiles(state),
    buildings: mapBuildingsToIsoBuildings(state),
    workers: mapWorkersToIsoWorkers(state),
  };
}
