import React from 'react';
import { GameCanvas } from '../../pixi/GameCanvas';
import { TopHud } from '../../ui/hud/TopHud';

export function GameLayout() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <GameCanvas />
      <TopHud />
    </div>
  );
}
