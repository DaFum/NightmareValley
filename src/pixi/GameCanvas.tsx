import React, { useEffect, useState } from 'react';

import { LocalStage as Stage } from './LocalStage';
import { GameStage } from './GameStage';

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

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <Stage width={size.width} height={size.height} options={{ backgroundColor: 0x1a1a24, antialias: false }}>
        <GameStage />
      </Stage>
    </div>
  );
}
