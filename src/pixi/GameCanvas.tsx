import { useEffect, useState } from 'react';

import { LocalStage as Stage } from './LocalStage';
import { GameStage } from './GameStage';
import { PixiAppProvider } from './PixiAppProvider';

export function GameCanvas() {
  const isBrowser = typeof window !== 'undefined';
  const [size, setSize] = useState(() => ({
    width: isBrowser ? window.innerWidth : 1024,
    height: isBrowser ? window.innerHeight : 768,
  }));

  useEffect(() => {
    if (!isBrowser) return;
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isBrowser]);

  // Gate canvas buffer preservation behind query parameter to avoid GPU cost in production.
  // Only needed for screenshot capture (canvas.toDataURL requires preserved buffer).
  const preserveBuffer = isBrowser && new URLSearchParams(window.location.search).has('preserve-canvas');

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <PixiAppProvider>
        <Stage width={size.width} height={size.height} options={{ backgroundColor: 0x1a1a24, antialias: false, preserveDrawingBuffer: preserveBuffer }}>
          <GameStage />
        </Stage>
      </PixiAppProvider>
    </div>
  );
}
