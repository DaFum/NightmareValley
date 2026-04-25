import React from 'react';
import { GameCanvas } from '../../pixi/GameCanvas';
import { TopHud } from '../../ui/hud/TopHud';
import InspectorPanel from '../../ui/panels/InspectorPanel';
import DebugLogisticsPanel from '../../ui/panels/DebugLogisticsPanel';
import { HudLayout } from './HudLayout';
import { useResponsiveLayout } from './useResponsiveLayout';

const IS_DEV = __DEV__;

export type GameLayoutProps = {
  canvas?: React.ReactNode;
  hud?: React.ReactNode;
  inspector?: React.ReactNode;
  panels?: React.ReactNode;
  mobileBreakpoint?: number;
  showDebugPanel?: boolean;
  className?: string;
};

export function GameLayout({
  canvas = <GameCanvas />,
  hud = <TopHud />,
  inspector = <InspectorPanel />,
  panels = null,
  mobileBreakpoint = 760,
  showDebugPanel = IS_DEV,
  className,
}: GameLayoutProps) {
  const isMobile = useResponsiveLayout(mobileBreakpoint);

  return (
    <div
      className={['game-layout', isMobile ? 'game-layout--mobile' : 'game-layout--desktop', className]
        .filter(Boolean)
        .join(' ')}
      data-mobile={isMobile ? 'true' : 'false'}
    >
      <section className="game-layout__canvas" aria-label="NightmareValley world">
        {canvas}
      </section>
      <HudLayout top={hud} right={inspector} bottom={panels} isMobile={isMobile} />
      {showDebugPanel && (
        <div style={{ position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 1000 }}>
          <DebugLogisticsPanel />
        </div>
      )}
    </div>
  );
}
