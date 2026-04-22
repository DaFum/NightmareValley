import React from "react";
import { Container } from "@pixi/react";
import { IsoTileRenderData } from "../../game/render/render.types";
import { IsoTileSprite } from "../entities/terrain/IsoTileSprite";

export interface IsoTerrainLayerProps {
  tiles: IsoTileRenderData[];
}

export const IsoTerrainLayer: React.FC<IsoTerrainLayerProps> = ({ tiles }) => {
  return (
    <Container zIndex={0}>
      {tiles.map((tile) => (
        <IsoTileSprite key={tile.id} data={tile} />
      ))}
    </Container>
  );
};
