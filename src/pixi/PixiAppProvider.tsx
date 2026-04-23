import React, { ReactNode } from "react";
import { useTextures } from "./utils/textureRegistry";

export function PixiAppProvider({ children }: { children: ReactNode }) {
  const { ready } = useTextures();

  // When textures are not ready, avoid rendering texture-dependent children.
  // This prevents runtime drawing using missing textures and surfaces a
  // clear loading indicator. Once ready, children are mounted normally.
  if (!ready) {
    return (
      <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', color: '#fff', zIndex: 9999 }}>
        Loading Textures...
      </div>
    );
  }

  return <>{children}</>;
}
