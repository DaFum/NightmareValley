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

// ─── Noise Utilities ──────────────────────────────────────────────────────────

function hashNoise(x: number, y: number, seed: number): number {
  let n = x | 0;
  n = (n << 13) ^ n;
  const h = (n * (n * n * 15731 + 789221) + 1376312589) ^ (y | 0) ^ seed;
  return (h >>> 0) / 4294967296;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Cubic smoothstep for smoother noise gradients (removes blocky artefacts)
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function smoothNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smoothstep(x - ix);
  const fy = smoothstep(y - iy);
  return lerp(
    lerp(hashNoise(ix,     iy,     seed), hashNoise(ix + 1, iy,     seed), fx),
    lerp(hashNoise(ix,     iy + 1, seed), hashNoise(ix + 1, iy + 1, seed), fx),
    fy,
  );
}

function fractalNoise(
  x: number, y: number, seed: number,
  octaves = 4, lacunarity = 2, gain = 0.5,
): number {
  let amplitude = 1, frequency = 1, sum = 0, max = 0;
  for (let o = 0; o < octaves; o++) {
    sum += smoothNoise(x * frequency, y * frequency, seed + o * 374) * amplitude;
    max += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return sum / max;
}

// Ridge noise — produces sharp mountain ridges using the |2n-1| inversion
function ridgeFractalNoise(
  x: number, y: number, seed: number, octaves = 4,
): number {
  let amplitude = 1, frequency = 1, sum = 0, max = 0;
  for (let o = 0; o < octaves; o++) {
    const n = smoothNoise(x * frequency, y * frequency, seed + o * 374);
    sum += (1 - Math.abs(2 * n - 1)) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return sum / max;
}

// Domain warp — offsets sample coordinates with noise so biome edges look
// organic instead of following smooth gradient contours.
function warpedCoords(
  nx: number, ny: number, seed: number, strength: number,
): [number, number] {
  const wx = fractalNoise(nx + 3.7, ny + 8.1, seed + 1001, 3, 2, 0.5) * 2 - 1;
  const wy = fractalNoise(nx + 9.3, ny + 2.6, seed + 2002, 3, 2, 0.5) * 2 - 1;
  return [nx + wx * strength, ny + wy * strength];
}

// ─── Road Network ─────────────────────────────────────────────────────────────

// Walks an organic path from (x0,y0) → (x1,y1) with controlled wobble.
// Guaranteed to reach the destination in O(|dx|+|dy|) steps.
function walkPath(
  x0: number, y0: number,
  x1: number, y1: number,
  mapWidth: number, mapHeight: number,
  out: Set<string>,
  noiseSeed: number,
): void {
  let x = x0, y = y0;
  const maxSteps = (Math.abs(x1 - x0) + Math.abs(y1 - y0)) * 4 + 12;

  for (let step = 0; step < maxSteps; step++) {
    out.add(`${x},${y}`);
    if (x === x1 && y === y1) break;

    const dx = x1 - x;
    const dy = y1 - y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const n = hashNoise(x + step * 13, y + step * 7, noiseSeed);

    let sx = 0, sy = 0;

    if (adx > 0 && ady > 0) {
      if (adx > ady) {
        sx = Math.sign(dx);
        if (n < 0.32) sy = Math.sign(dy); // 32% chance to also step toward Y goal
      } else if (ady > adx) {
        sy = Math.sign(dy);
        if (n < 0.32) sx = Math.sign(dx);
      } else {
        sx = Math.sign(dx);
        sy = Math.sign(dy);
      }
    } else {
      sx = adx > 0 ? Math.sign(dx) : 0;
      sy = ady > 0 ? Math.sign(dy) : 0;
    }

    x = Math.max(0, Math.min(mapWidth  - 1, x + sx));
    y = Math.max(0, Math.min(mapHeight - 1, y + sy));
  }
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export function generateProceduralTiledMap(opts: GenOptions = {}): TiledMapData {
  const width  = opts.width  ?? 48;
  const height = opts.height ?? 48;
  const seed   = opts.seed !== undefined
    ? opts.seed
    : Math.floor(Math.random() * 2 ** 31);

  const tiles: TiledTileDef[] = TERRAIN_TYPES.map((t, idx) => ({
    id: idx,
    properties: [{ name: 'type', type: 'string', value: t }],
  }));
  const tileset: TiledTileset = { firstgid: 1, name: 'procedural_terrain', tiles };

  // Noise scale — larger value = smaller features, more varied
  const scale = 4.5;

  // ── Biome zone centres (0–1 normalised) seeded per map ─────────────────────
  // Mountain range: biased toward the upper-right quadrant
  const zMtnX = 0.58 + (hashNoise(1, 0, seed) - 0.5) * 0.22;
  const zMtnY = 0.22 + (hashNoise(2, 0, seed) - 0.5) * 0.18;
  // Deep forest: biased toward the left side
  const zForX = 0.16 + (hashNoise(3, 0, seed) - 0.5) * 0.14;
  const zForY = 0.42 + (hashNoise(4, 0, seed) - 0.5) * 0.18;
  // Ash bog: lower portion of the map
  const zBogX = 0.38 + (hashNoise(5, 0, seed) - 0.5) * 0.18;
  const zBogY = 0.70 + (hashNoise(6, 0, seed) - 0.5) * 0.16;
  // Corruption source: radiates from the western edge, south half
  const cCorX = width  * (0.04 + hashNoise(7, 0, seed) * 0.22);
  const cCorY = height * (0.56 + hashNoise(8, 0, seed) * 0.34);

  // ── Per-tile terrain generation ─────────────────────────────────────────────
  const terrain: TerrainType[] = new Array(width * height).fill('scarredEarth');

  for (let ty = 0; ty < height; ty++) {
    for (let tx = 0; tx < width; tx++) {
      const nx0 = (tx / width)  * scale;
      const ny0 = (ty / height) * scale;

      // Domain-warp the two primary noise layers for organic biome edges
      const [wnx, wny] = warpedCoords(nx0,         ny0,         seed,        0.55);
      const [mnx, mny] = warpedCoords(nx0 + 77.3,  ny0 + 41.1,  seed + 5381, 0.48);

      // Core noise fields
      const elev   = fractalNoise(wnx, wny, seed,        6, 2.1, 0.48);
      const moist  = fractalNoise(mnx, mny, seed + 5381, 4, 2.0, 0.55);
      const ridge  = ridgeFractalNoise(nx0 + 211.7, ny0 + 44.2, seed + 1337, 5);
      const detail = fractalNoise(nx0 * 2.1 + 33.1, ny0 * 2.1 + 71.4, seed + 8888, 3, 2, 0.5);

      // Normalised tile coords
      const nx1 = tx / width;
      const ny1 = ty / height;

      // Zone proximity boosts
      const dMtn = Math.hypot(nx1 - zMtnX, ny1 - zMtnY);
      const dFor = Math.hypot(nx1 - zForX, ny1 - zForY);
      const dBog = Math.hypot(nx1 - zBogX, ny1 - zBogY);

      // Effective elevation is pushed higher near the mountain zone
      const elevBoosted  = Math.min(1, elev  + Math.max(0, 0.38 - dMtn) * 0.75);
      // Effective moisture is boosted near the forest zone
      const moistBoosted = Math.min(1, moist + Math.max(0, 0.28 - dFor) * 0.65);
      // Bog score combines proximity + low moisture + detail noise
      const bogScore = Math.max(0, 0.28 - dBog) * 1.3
                     + (moist < 0.28 ? 0.12 : 0)
                     + (detail < 0.35 && elev < 0.38 ? 0.08 : 0);

      // Corruption: radial decay from source + noise modulation
      const dCor = Math.hypot(tx - cCorX, ty - cCorY);
      const corNoise = fractalNoise(nx0 * 0.8 + 411, ny0 * 0.8 + 877, seed + 7777, 3, 2, 0.5);
      const corruption = Math.max(0, 1 - dCor / (width * 0.30)) * 0.80
                       + corNoise * 0.20;

      // Distance from the starting buildings cluster (10-14, 10)
      const startDist = Math.hypot(tx - 12, ty - 10);

      // ── Biome assignment (order = priority) ──
      let t: TerrainType = 'scarredEarth';

      if      (elevBoosted > 0.80 || (ridge > 0.82 && dMtn < 0.42))           t = 'ribMountain';
      else if (elevBoosted > 0.66 && ridge > 0.58 && startDist > 7)            t = 'cathedralRock';
      else if (elev < 0.12 && startDist > 8)                                   t = 'placentaLake';
      else if (bogScore > 0.20 && elev < 0.44 && startDist > 7)               t = 'ashBog';
      else if (corruption > 0.70 && startDist > 11)                            t = 'occupiedScar';
      else if (moistBoosted > 0.60 && elev > 0.28 && elev < 0.74 && startDist > 4) t = 'weepingForest';
      else if (elev < 0.24 && moist < 0.38 && startDist > 7)                  t = 'ashBog';
      else                                                                       t = 'scarredEarth';

      // Protect the starting clearing
      if (startDist < 6) t = 'scarredEarth';

      terrain[ty * width + tx] = t;
    }
  }

  // ── Road network ──────────────────────────────────────────────────────────
  // Roads start from the building cluster at (12,10); skip on maps too small
  // to contain that origin tile so walkPath never adds out-of-bounds coords.
  const roadSet  = new Set<string>();
  const roadSeed = seed + 31337;

  if (width > 13 && height > 11) {
    // Road 1: NW artery — toward the upper-left of the map
    const nwX = Math.round(width  * (0.10 + hashNoise(10, 0, seed) * 0.12));
    const nwY = Math.round(height * (0.07 + hashNoise(11, 0, seed) * 0.12));
    const nwMidX = Math.round((12 + nwX) / 2 + (hashNoise(12, 0, seed) - 0.5) * 10);
    const nwMidY = Math.round((10 + nwY) / 2 + (hashNoise(13, 0, seed) - 0.5) * 10);
    walkPath(12, 10, nwMidX, nwMidY, width, height, roadSet, roadSeed);
    walkPath(nwMidX, nwMidY, nwX, nwY, width, height, roadSet, roadSeed + 1);

    // Road 2: SE artery — through the open lands toward resources
    const seX = Math.round(width  * (0.68 + hashNoise(14, 0, seed) * 0.18));
    const seY = Math.round(height * (0.58 + hashNoise(15, 0, seed) * 0.22));
    const seMidX = Math.round((12 + seX) / 2 + (hashNoise(16, 0, seed) - 0.5) * 10);
    const seMidY = Math.round((10 + seY) / 2 + (hashNoise(17, 0, seed) - 0.5) * 10);
    walkPath(12, 10, seMidX, seMidY, width, height, roadSet, roadSeed + 2);
    walkPath(seMidX, seMidY, seX, seY, width, height, roadSet, roadSeed + 3);

    // Road 3: Forest spur — short path toward the western forest zone
    const fSpurX = Math.max(1, Math.min(width  - 2, Math.round(width  * zForX + (hashNoise(18, 0, seed) - 0.5) * 4)));
    const fSpurY = Math.max(1, Math.min(height - 2, Math.round(height * zForY + (hashNoise(19, 0, seed) - 0.5) * 4)));
    walkPath(12, 10, fSpurX, fSpurY, width, height, roadSet, roadSeed + 4);
  }

  // Stamp roads — lakes and mountain rock block roads
  for (const key of roadSet) {
    const [rx, ry] = key.split(',').map(Number);
    const idx = ry * width + rx;
    const cur = terrain[idx];
    if (cur !== 'placentaLake' && cur !== 'ribMountain') {
      terrain[idx] = 'scarPath';
    }
  }

  // ── Hand-authored starting valley ─────────────────────────────────────────
  // Guard: the authored regions use coordinates up to col 20 / row 24.
  // Skip entirely on small maps to avoid out-of-bounds array writes and to
  // preserve the old behaviour for test / mini-map use-cases.
  const MIN_AUTHORED_W = 21; // max column index used below is 20
  const MIN_AUTHORED_H = 25; // max row index used below is 24
  if (width >= MIN_AUTHORED_W && height >= MIN_AUTHORED_H) {
    // Dense forest edge to the west — immediate resource access.
    // Range ends at vx=6 (not 7) to avoid overwriting tile (7,7) which
    // game.store.ts places the vaultOfDigestiveStone building on.
    for (let vy = 6; vy <= 14; vy++) {
      for (let vx = 2; vx <= 6; vx++) {
        if (terrain[vy * width + vx] !== 'placentaLake') {
          terrain[vy * width + vx] = 'weepingForest';
        }
      }
    }

    // Cathedral ruins north of start — visual landmark and narrative anchor
    // Outer ring: cathedralRock; inner fill: ribMountain
    for (let ry = 3; ry <= 7; ry++) {
      for (let rx = 10; rx <= 16; rx++) {
        const isEdge = rx === 10 || rx === 16 || ry === 3 || ry === 7;
        terrain[ry * width + rx] = isEdge ? 'cathedralRock' : 'ribMountain';
      }
    }

    // Dark pool SE of start — water source, strategic chokepoint
    for (let wy = 13; wy <= 17; wy++) {
      for (let wx = 15; wx <= 20; wx++) {
        terrain[wy * width + wx] = 'placentaLake';
      }
    }

    // Ash bog patch SW of start — atmospheric hazard zone
    for (let by = 12; by <= 16; by++) {
      for (let bx = 4; bx <= 9; bx++) {
        if (terrain[by * width + bx] === 'scarredEarth') {
          terrain[by * width + bx] = 'ashBog';
        }
      }
    }

    // Corruption seeping in from the left edge (visible threat from start)
    for (let cy = 18; cy <= 24; cy++) {
      for (let cx = 0; cx <= 5; cx++) {
        const fade = hashNoise(cx * 3, cy, seed + 9001);
        if (fade > 0.30) terrain[cy * width + cx] = 'occupiedScar';
      }
    }

    // Ensure building tiles are always walkable scarredEarth
    terrain[10 * width + 10] = 'scarredEarth';
    terrain[10 * width + 14] = 'scarredEarth';
  }

  // ── Encode to GID array ──────────────────────────────────────────────────
  const data: number[] = terrain.map(t => {
    const tid = TERRAIN_TYPES.indexOf(t);
    return (tid >= 0 ? tid : 0) + tileset.firstgid;
  });

  const terrainLayer = {
    type: 'tilelayer' as const,
    name: 'Terrain',
    width,
    height,
    data,
  };

  return { width, height, tilewidth: 64, tileheight: 32, layers: [terrainLayer], tilesets: [tileset] };
}

export default generateProceduralTiledMap;
