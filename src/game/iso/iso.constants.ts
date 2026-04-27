export const TILE_WIDTH = 128;
export const TILE_HEIGHT = 64;

export const HALF_TILE_WIDTH = TILE_WIDTH / 2;
export const HALF_TILE_HEIGHT = TILE_HEIGHT / 2;

export const DEFAULT_ISO_SETTINGS = {
	tileWidth: TILE_WIDTH,
	tileHeight: TILE_HEIGHT,
};

// Half-tile dimensions consumed by the footfall overlay layers. Numerically equivalent
// to HALF_TILE_WIDTH / HALF_TILE_HEIGHT; kept as a separate alias so the overlay code
// reads with intent. Terrain and worker layers redefine local TILE_WIDTH/HEIGHT in
// render.adapter.ts and do NOT use these constants.
export const ISO_TILE_WIDTH = 64;
export const ISO_TILE_HEIGHT = 32;

export const TERRAIN_Z_INDEX_BIAS = -1000;
