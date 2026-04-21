export function screenToTile(
  sx: number,
  sy: number,
  tileWidth: number,
  tileHeight: number
) {
  return {
    tx: (sx / (tileWidth / 2) + sy / (tileHeight / 2)) / 2,
    ty: (sy / (tileHeight / 2) - sx / (tileWidth / 2)) / 2,
  };
}

export function screenToIsoTile(
  screenX: number,
  screenY: number,
  cameraX: number,
  cameraY: number,
  zoom: number,
  tileWidth: number,
  tileHeight: number
) {
  const localX = (screenX - cameraX) / zoom;
  const localY = (screenY - cameraY) / zoom;

  const { tx, ty } = screenToTile(localX, localY, tileWidth, tileHeight);

  return {
    tileX: Math.floor(tx),
    tileY: Math.floor(ty),
  };
}
