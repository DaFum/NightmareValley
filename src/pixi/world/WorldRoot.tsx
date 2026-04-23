import React from "react";
import { Container } from "@pixi/react";
import { useRenderWorld } from "../hooks/useRenderWorld";
import { IsoTerrainLayer } from "../layers/IsoTerrainLayer";
import { IsoBuildingLayer } from "../layers/IsoBuildingLayer";
import { IsoWorkerLayer } from "../layers/IsoWorkerLayer";


export const WorldRoot: React.FC = () => {
  const renderWorld = useRenderWorld();

  return (
    <Container sortableChildren={true}>
      <IsoTerrainLayer tiles={renderWorld.tiles} />
      <IsoBuildingLayer buildings={renderWorld.buildings} />
      <IsoWorkerLayer workers={renderWorld.workers} />
    </Container>
  );
};
