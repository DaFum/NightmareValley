import { EconomySimulationState } from "../core/economy.simulation";
import { IsoRenderWorld } from "./render.types";
import { tileToScreen } from "../iso/iso.project";
import { getEntityZIndex } from "../iso/iso.depth";

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

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

    world.buildings.push({
      id: building.id,
      tileX: building.position.x,
      tileY: building.position.y,
      widthTiles: 1,
      heightTiles: 1,
      originTileX: building.position.x,
      originTileY: building.position.y,
      screenX: sx,
      screenY: sy,
      footX: sx,
      footY: footY,
      zIndex: getEntityZIndex({ footX: sx, footY: footY }),
      spriteKey: `building_${building.type}`,
      selected: false,
      state: building.isActive ? "working" : "idle",
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

    world.workers.push({
      id: worker.id,
      worldX: worker.position.x,
      worldY: worker.position.y,
      screenX: sx,
      screenY: sy,
      footX: sx,
      footY: footY,
      zIndex: getEntityZIndex({ footX: sx, footY: footY }),
      dir: "SE", // simplified
      animation: worker.isIdle ? "idle" : "walk",
      carrying: undefined, // simplified
    });
  }

  return world;
}
