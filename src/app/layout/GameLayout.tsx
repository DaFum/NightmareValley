import React from 'react';
import { GameCanvas } from '../../pixi/GameCanvas';
import { TopHud } from '../../ui/hud/TopHud';
import InspectorPanel from '../../ui/panels/InspectorPanel';
import DebugLogisticsPanel from '../../ui/panels/DebugLogisticsPanel';
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
  panels = null,
  className,
}: GameLayoutProps) {
  return (
    <div className={['game-layout', className].filter(Boolean).join(' ')}>
      <section className="game-layout__canvas" aria-label="NightmareValley world">
        {canvas}
      </section>
      <HudLayout top={hud} right={<InspectorPanel />} bottom={panels} />
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 1000 }}>
          <DebugLogisticsPanel />
        </div>
      )}
    </div>
  );
}
