import React from 'react';

import { Stage } from '@pixi/react';
import { GameStage } from './GameStage';

export function GameCanvas() {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        options={{ backgroundColor: 0x1a1a24, antialias: false }}
      >
        <GameStage />
      </Stage>
    </div>
  );
}
