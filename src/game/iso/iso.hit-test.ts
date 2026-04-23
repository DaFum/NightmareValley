import { IsoRenderWorld } from "../render/render.types";
import { screenToIsoTile } from "./iso.inverse";

export interface HitResult {
  tileId?: string;
  buildingId?: string;
  workerId?: string;
}

export function getIsoHit(
  screenX: number,
  screenY: number,
  world: IsoRenderWorld,
  cameraX: number,
  cameraY: number,
  zoom: number,
  tileWidth: number,
  tileHeight: number
): HitResult {
  const { tileX, tileY } = screenToIsoTile(
    screenX,
    screenY,
    cameraX,
    cameraY,
    zoom,
    tileWidth,
    tileHeight
  );

  const tileId = `tile_${tileX}_${tileY}`;

  // Simple hit test prioritizing buildings > workers > tiles based on tile coords
  // Real implementation might do bounding box checks against screen coords

  const building = world.buildings.find(b => b.tileX === tileX && b.tileY === tileY);
  const worker = world.workers.find(w => Math.round(w.worldX) === tileX && Math.round(w.worldY) === tileY);
  const tile = world.tiles.find(t => t.id === tileId);

  return {
    buildingId: building?.id,
    workerId: worker?.id,
    tileId: tile?.id
  };
}
