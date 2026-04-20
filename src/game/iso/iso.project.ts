export function tileToScreen(
  tx: number,
  ty: number,
  tileWidth: number,
  tileHeight: number
) {
  return {
    x: (tx - ty) * (tileWidth / 2),
    y: (tx + ty) * (tileHeight / 2),
  };
}
