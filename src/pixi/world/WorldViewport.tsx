import React, { ReactNode } from "react";
import { Container } from "@pixi/react";
import { useCameraStore } from "../../store/camera.store";

export interface WorldViewportProps {
  children: ReactNode;
}

export const WorldViewport: React.FC<WorldViewportProps> = ({ children }) => {
  const x = useCameraStore((state) => state.x);
  const y = useCameraStore((state) => state.y);
  const zoom = useCameraStore((state) => state.zoom);

  // We place the camera at the center of the screen initially in the GameStage
  // so this container is just applying pan offsets and zoom.
  return (
    <Container position={[x, y]} scale={[zoom, zoom]} eventMode="none">
      {children}
    </Container>
  );
};
