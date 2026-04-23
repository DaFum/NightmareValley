import React from "react";
import { IsoWorkerRenderData } from "../../game/iso/iso.types";
import { IsoWorkerEntity } from "./IsoWorkerEntity";

export interface IsoWorkerLayerProps {
  workers: IsoWorkerRenderData[];
}

export const IsoWorkerLayer: React.FC<IsoWorkerLayerProps> = ({ workers }) => {
  return (
    <>
      {workers.map((worker) => (
        <IsoWorkerEntity key={worker.id} data={worker as any} />
      ))}
    </>
  );
};
