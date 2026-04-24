import { TiledMapData } from "./map.types";
import { TerritoryState, MapTile } from "../core/game.types";
import { TerrainType } from "../core/economy.types";
import { createId } from "../core/economy.simulation";

export function parseTiledMap(mapData: TiledMapData): TerritoryState {
  const territory: TerritoryState = { tiles: {}, tileIndex: {} };

  // Helper to resolve terrain type from gid
  const resolveTerrainFromGid = (gid: number): TerrainType => {
    // Basic resolution: assume gid 1 maps to 'scarredEarth'
    for (const ts of mapData.tilesets) {
      if (gid >= ts.firstgid) {
        const localId = gid - ts.firstgid;
        const tileDef = ts.tiles?.find(t => t.id === localId);
        if (tileDef && tileDef.properties) {
          const typeProp = tileDef.properties.find(p => p.name === "type");
          if (typeProp && typeof typeProp.value === "string") {
            return typeProp.value as TerrainType;
          }
        }
      }
    }
    return "scarredEarth"; // Default fallback
  };

  const terrainLayer = mapData.layers.find(l => l.name === "Terrain" && l.type === "tilelayer");

  if (terrainLayer && terrainLayer.data && terrainLayer.width && terrainLayer.height) {
    for (let y = 0; y < terrainLayer.height; y++) {
      for (let x = 0; x < terrainLayer.width; x++) {
        const index = y * terrainLayer.width + x;
        const gid = terrainLayer.data[index];

        if (gid === 0) continue; // Empty tile

        const terrain = resolveTerrainFromGid(gid);
        const tileId = createId("tile");

        territory.tiles[tileId] = {
          id: tileId,
          position: { x, y },
          terrain,
        };
        territory.tileIndex![`${x},${y}`] = tileId;
      }
    }
  }

  return territory;
}
