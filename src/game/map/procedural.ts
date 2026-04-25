import { TiledMapData, TiledTileset, TiledTileDef } from './map.types';
import { TerrainType } from '../core/economy.types';

type GenOptions = {
  width?: number;
  height?: number;
  seed?: number;
};

const TERRAIN_TYPES: TerrainType[] = [
  'scarredEarth',
  'weepingForest',
  'ribMountain',
  'placentaLake',
  'scarPath',
  'occupiedScar',
  'ashBog',
  'cathedralRock',
];

function hashNoise(x: number, y: number, seed: number) {
  // 32-bit mix to produce a pseudo-random value in [0,1)
  let n = x | 0;
  n = (n << 13) ^ n;
  let h = (n * (n * n * 15731 + 789221) + 1376312589) ^ (y | 0) ^ seed;
  h = (h >>> 0) % 4294967295;
  return (h >>> 0) / 4294967295;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothNoise(x: number, y: number, seed: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const v00 = hashNoise(ix, iy, seed);
  const v10 = hashNoise(ix + 1, iy, seed);
  const v01 = hashNoise(ix, iy + 1, seed);
  const v11 = hashNoise(ix + 1, iy + 1, seed);

  const i1 = lerp(v00, v10, fx);
  const i2 = lerp(v01, v11, fx);
  return lerp(i1, i2, fy);
}

function fractalNoise(x: number, y: number, seed: number, octaves = 4, lacunarity = 2, gain = 0.5) {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let max = 0;
  for (let o = 0; o < octaves; o++) {
    sum += smoothNoise(x * frequency, y * frequency, seed + o * 374) * amplitude;
    max += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return sum / max;
}

export function generateProceduralTiledMap(opts: GenOptions = {}): TiledMapData {
  const width = opts.width || 48;
  const height = opts.height || 48;
  const seed = opts.seed !== undefined ? opts.seed : Math.floor(Math.random() * 2 ** 31);

  // Tileset definition: map each terrain to a tile id and give it a 'type' property
  const tiles: TiledTileDef[] = TERRAIN_TYPES.map((t, idx) => ({
    id: idx,
    properties: [{ name: 'type', type: 'string', value: t }],
  }));

  const tileset: TiledTileset = {
    firstgid: 1,
    name: 'procedural_terrain',
    tiles,
  };

  const scale = 5.5;
  const start = { x: 5, y: 5 };

  const data: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x / width) * scale;
      const ny = (y / height) * scale;
      const dx = x - start.x;
      const dy = y - start.y;
      const startDistance = Math.sqrt(dx * dx + dy * dy);

      const h = fractalNoise(nx, ny, seed, 5, 2, 0.5);
      const m = fractalNoise(nx + 153.7, ny + 421.3, seed + 9876, 4, 2, 0.55);
      const ridge = fractalNoise(nx + 711.2, ny + 91.4, seed + 2442, 3, 2, 0.6);

      let terrain: TerrainType = 'scarredEarth';

      if (startDistance < 7) terrain = 'scarredEarth';
      else if (Math.abs((x - y) - 8) <= 1 && x > 8 && y > 4) terrain = 'scarPath';
      else if (h < 0.14 && startDistance > 10) terrain = 'placentaLake';
      else if (h > 0.79 || (ridge > 0.76 && x > width * 0.55)) terrain = 'ribMountain';
      else if (h > 0.67) terrain = 'cathedralRock';
      else if (m > 0.66 && h > 0.35) terrain = 'weepingForest';
      else if (m < 0.18) terrain = 'ashBog';
      else if (m < 0.33) terrain = 'scarPath';
      else if (m > 0.6) terrain = 'occupiedScar';
      else terrain = 'scarredEarth';

      // Hand-shaped opening valley: enough authored structure for a
      // Settlers-style first economy while the outer map stays procedural.
      // Override coordinates go up to x=15, y=13 — only apply when the map is large enough.
      const MAX_OVERRIDE_X = 15;
      const MAX_OVERRIDE_Y = 13;
      if (width > MAX_OVERRIDE_X && height > MAX_OVERRIDE_Y) {
        if (x >= 2 && x <= 4 && y >= 8 && y <= 10) terrain = 'weepingForest';
        if (x >= 10 && x <= 13 && y >= 4 && y <= 7) {
          terrain = (x + y) % 3 === 0 ? 'cathedralRock' : 'ribMountain';
        }
        if (x >= 6 && x <= 9 && y >= 9 && y <= 11) terrain = 'ashBog';
        if (x >= 12 && x <= 15 && y >= 10 && y <= 13) terrain = 'placentaLake';
        if (
          (y === 6 && x >= 4 && x <= 12) ||
          (x === 7 && y >= 6 && y <= 10) ||
          (x === 12 && y >= 6 && y <= 11)
        ) {
          terrain = 'scarPath';
        }
      }

      const tid = TERRAIN_TYPES.indexOf(terrain);
      const gid = (tid >= 0 ? tid : 0) + tileset.firstgid;
      data.push(gid);
    }
  }

  const terrainLayer = {
    type: 'tilelayer',
    name: 'Terrain',
    width,
    height,
    data,
  } as const;

  const map: TiledMapData = {
    width,
    height,
    tilewidth: 64,
    tileheight: 32,
    layers: [terrainLayer],
    tilesets: [tileset],
  };

  return map;
}

export default generateProceduralTiledMap;
