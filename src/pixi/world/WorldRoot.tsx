import React from "react";
import { Container } from "@pixi/react";
import { useRenderWorld } from "../hooks/useRenderWorld";
import { IsoTerrainLayer } from "../layers/IsoTerrainLayer";

export const WorldRoot: React.FC = () => {
  const renderWorld = useRenderWorld();

  return (
    <Container sortableChildren={true}>
      <IsoTerrainLayer tiles={renderWorld.tiles} />
      {/* Other layers will go here */}
    </Container>
  );
};
