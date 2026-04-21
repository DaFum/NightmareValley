import React, { ReactNode } from "react";
import { useTextures } from "./utils/textureRegistry";

export function PixiAppProvider({ children }: { children: ReactNode }) {
  const { ready } = useTextures();

  if (!ready) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: '#000', color: '#fff' }}>
        Loading Textures...
      </div>
    );
  }

  return <>{children}</>;
}
