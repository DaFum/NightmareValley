import { EconomySimulationState } from "../core/economy.simulation";
import { IsoRenderWorld } from "./render.types";
import { tileToScreen } from "../iso/iso.project";
import { getEntityZIndex } from "../iso/iso.depth";
import { getBuildingDefinition, getWorkerDefinition } from "../core/economy.data";
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

export function mapEconomyStateToIsoWorld(
  state: EconomySimulationState
): IsoRenderWorld {
  const world: IsoRenderWorld = {
    tiles: [],
    buildings: [],
    workers: [],
  };

  // Convert map tiles
  for (const [tileId, mapTile] of Object.entries(state.territory.tiles)) {
    const { x: sx, y: sy } = tileToScreen(
      mapTile.position.x,
      mapTile.position.y,
      TILE_WIDTH,
      TILE_HEIGHT
    );

    world.tiles.push({
      id: tileId,
      screenX: sx,
      screenY: sy,
      textureKey: `terrain_${mapTile.terrain}`,
      chunkId: "0,0", // simplified
    });
  }

  // Convert buildings
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

    // Use the manifest-registered key format for building sprites so the
    // texture loader's keys (e.g. `buildings_stage4_organHarvester`) match
    // what the renderer asks for.
    const spriteKey = `buildings_stage${buildStage}_${building.type}`;

    world.buildings.push({
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
      outputFill: Math.max(0, Math.min(1, Math.max(...Object.values(building.outputBuffer).map(val => (val ?? 0) / DEFAULT_SIMULATION_CONFIG.buildingOutputBufferLimit), 0))),
    });
  }

  // Convert workers
  for (const worker of Object.values(state.workers)) {
    const { x: sx, y: sy } = tileToScreen(
      worker.position.x,
      worker.position.y,
      TILE_WIDTH,
      TILE_HEIGHT
    );

    const footY = sy + TILE_HEIGHT / 2;
    const variant = (hashStringToInt(worker.id) % 3) + 1;

    let dir: "NE" | "NW" | "SE" | "SW" = "SE";
    let renderState: IsoRenderWorld["workers"][0]["state"] = "idle";
    let animation: IsoRenderWorld["workers"][0]["animation"] = "idle";
    let carrying: string | undefined = undefined;

    const activeTask = state.transport.activeCarrierTasks[worker.id];
    if (activeTask) {
      renderState = "carrying";
      animation = "carry";
      carrying = activeTask.resourceType;

      const dropoffBuilding = state.buildings[activeTask.dropoffBuildingId];
      const targetBuilding = dropoffBuilding;

      if (targetBuilding) {
        const dx = targetBuilding.position.x - worker.position.x;
        const dy = targetBuilding.position.y - worker.position.y;
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

    world.workers.push({
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

  return world;
}
