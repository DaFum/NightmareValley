import { WorldState } from '../game/world/world.types';
import { chunkId, tileToChunk, tilesInChunk } from '../game/map/map.chunks';
import { CHUNK_SIZE } from '../game/map/map.constants';
import { footprintBounds, footprintTiles } from '../game/map/map.building-slots';
import { getTileAt, isBuildable, neighbors } from '../game/map/map.query';
import { computeIsoWorldBounds } from '../game/iso/iso.bounds';
import { selectTileAtScreen } from '../game/iso/iso.selection';
import { snapToNearestTile } from '../game/iso/iso.snap';
import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from '../game/iso/iso.constants';

export function resolvePointerToTile(
  state: WorldState,
  screenX: number,
  screenY: number,
  cameraX: number,
  cameraY: number,
  zoom: number,
) {
  const selected = selectTileAtScreen(screenX, screenY, cameraX, cameraY, zoom, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);
  const snapped = snapToNearestTile(selected.tileX, selected.tileY);
  const tile = getTileAt(state.territory, snapped.x, snapped.y);
  if (!tile) return null;

  const chunk = tileToChunk(snapped.x, snapped.y, CHUNK_SIZE);
  return {
    tile,
    chunk: { ...chunk, id: chunkId(chunk.cx, chunk.cy), tiles: tilesInChunk(chunk.cx, chunk.cy, CHUNK_SIZE) },
    buildable: isBuildable(state.territory, snapped.x, snapped.y),
    adjacent: neighbors(snapped.x, snapped.y),
  };
}

export function getMapFootprint(width: number, height: number, originX: number, originY: number) {
  return {
    tiles: footprintTiles(width, height, originX, originY),
    bounds: footprintBounds(width, height, originX, originY),
  };
}

export function getIsoWorldBoundsForTerritory(state: WorldState) {
  const width = Math.max(...Object.values(state.territory.tiles).map((tile) => tile.position.x)) + 1;
  const height = Math.max(...Object.values(state.territory.tiles).map((tile) => tile.position.y)) + 1;
  return computeIsoWorldBounds(width, height, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);
}
