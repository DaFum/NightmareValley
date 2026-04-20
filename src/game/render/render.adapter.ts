import { EconomySimulationState } from "../core/economy.simulation";
import { IsoRenderWorld } from "./render.types";
import { tileToScreen } from "../iso/iso.project";
import { getEntityZIndex } from "../iso/iso.depth";
import { getBuildingDefinition, getWorkerDefinition } from "../core/economy.data";

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
        // Extremely simplified check: if it has inputs but they are empty
        if (def.recipeIds && def.recipeIds.length > 0) {
             const inputCount = Object.keys(building.inputBuffer).length;
             if (inputCount === 0) {
                 renderState = "waitingForInput";
                 statusIcons.push("missing_input");
             }
        }
    }

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
      spriteKey: `building_${building.type}`,
      variant,
      buildStage: building.level >= 1 ? 4 : 0, // simplified mapping
      state: renderState,
      selected: false,
      hovered: false,
      statusIcons,
      effectFlags,
      inputFill: Object.keys(building.inputBuffer).length > 0 ? 0.5 : 0,
      outputFill: Object.keys(building.outputBuffer).length > 0 ? 0.5 : 0,
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

    // Simplistic direction and animation derivation
    let dir: "NE" | "NW" | "SE" | "SW" = "SE";
    let renderState: IsoRenderWorld["workers"][0]["state"] = "idle";
    let animation: IsoRenderWorld["workers"][0]["animation"] = "idle";
    let carrying: string | undefined = undefined;

    // Determine carrier logic via active tasks (simplification)
    const activeTask = state.transport.activeCarrierTasks[worker.id];
    if (activeTask) {
        renderState = "carrying";
        animation = "carry";
        carrying = activeTask.resourceType;
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
