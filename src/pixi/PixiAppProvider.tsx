import React, { ReactNode } from "react";
import { useTextures } from "./utils/textureRegistry";

export function PixiAppProvider({ children }: { children: ReactNode }) {
  const { ready } = useTextures();

  // NOTE: For debugging runtime texture issues we mount the app children
  // even while textures are still loading. This allows inspecting the
  // rendered PIXI stage and texture cache in the browser. The loading
  // indicator is kept as an overlay so we can see load progress.
  return (
    <>
      {children}
      {!ready && (
        <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', color: '#fff', zIndex: 9999 }}>
          Loading Textures...
        </div>
      )}
    </>
  );
}
