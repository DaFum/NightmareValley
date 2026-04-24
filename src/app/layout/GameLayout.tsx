import React from 'react';
import { GameCanvas } from '../../pixi/GameCanvas';
import { TopHud } from '../../ui/hud/TopHud';
import { BuildingMenu } from '../../ui/panels/BuildingMenu';
import InspectorPanel from '../../ui/panels/InspectorPanel';
import { HudLayout } from './HudLayout';

export type GameLayoutProps = {
  canvas?: React.ReactNode;
  hud?: React.ReactNode;
  panels?: React.ReactNode;
  className?: string;
};

export function GameLayout({
  canvas = <GameCanvas />,
  hud = <TopHud />,
  panels = <BuildingMenu />,
  className,
}: GameLayoutProps) {
  return (
    <div className={['game-layout', className].filter(Boolean).join(' ')}>
      <section className="game-layout__canvas" aria-label="NightmareValley world">
        {canvas}
      </section>
      <HudLayout top={hud} right={<InspectorPanel />} bottom={panels} />
    </div>
  );
}
