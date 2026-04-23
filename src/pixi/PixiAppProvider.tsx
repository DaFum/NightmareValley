import React, { ReactNode } from "react";
import { useTextures } from "./utils/textureRegistry";

type PixiAppProviderProps = {
  children: ReactNode;
  /**
   * When true, children are mounted immediately while a loading overlay
   * is shown on top. When false (default), children are blocked until
   * textures are ready. Default is false to preserve the deliberate
   * blocking behavior introduced in the current PR.
   */
  mountChildrenWhileLoading?: boolean;
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(0,0,0,0.85)',
  color: '#fff',
  zIndex: 9999,
};

export function PixiAppProvider({ children, mountChildrenWhileLoading = false }: PixiAppProviderProps) {
  const { ready } = useTextures();

  // Default behavior blocks children until textures are ready. If
  // `mountChildrenWhileLoading` is enabled, we render children early and
  // show an overlay on top (the previous behavior before this PR).
  if (!ready) {
    if (mountChildrenWhileLoading) {
      return (
        <>
          {children}
          <div style={overlayStyle}>Loading Textures...</div>
        </>
      );
    }

    return <div style={overlayStyle}>Loading Textures...</div>;
  }

  return <>{children}</>;
}
