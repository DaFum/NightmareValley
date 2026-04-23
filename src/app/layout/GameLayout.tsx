import React from 'react';
import { GameCanvas } from '../../pixi/GameCanvas';
import { TopHud } from '../../ui/hud/TopHud';
import { BuildingMenu } from '../../ui/panels/BuildingMenu';

export function GameLayout() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <GameCanvas />
      <TopHud />
      <BuildingMenu />
    </div>
  );
}
