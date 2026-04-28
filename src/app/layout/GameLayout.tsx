import React from 'react';
import { GameCanvas } from '../../pixi/GameCanvas';
import { TopHud } from '../../ui/hud/TopHud';
import InspectorPanel from '../../ui/panels/InspectorPanel';
import DebugLogisticsPanel from '../../ui/panels/DebugLogisticsPanel';
import EconomyPanel from '../../ui/panels/EconomyPanel';
import WarehousePanel from '../../ui/panels/WarehousePanel';
import SettlementBriefPanel from '../../ui/panels/SettlementBriefPanel';
import GameGuidePanel from '../../ui/panels/GameGuidePanel';
import EventLogPanel from '../../ui/panels/EventLogPanel';
import { BuildingMenu } from '../../ui/panels/BuildingMenu';
import { HudLayout } from './HudLayout';
import Particles from '../../components/Particles';
import SvgAnimationIntegrator from '../../pixi/SvgAnimationIntegrator';
import { useResponsiveLayout } from './useResponsiveLayout';
import { evaluateGameOutcome } from '../../game/core/victory.rules';
import { player1Id, useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';

const IS_DEV = __DEV__;
const ContentCodexPanel = React.lazy(() => import('../../ui/panels/ContentCodexPanel'));
const ProductionChainPanel = React.lazy(() => import('../../ui/panels/ProductionChainPanel'));
const VictoryDialog = React.lazy(() => import('../../ui/dialogs/VictoryDialog'));
const PauseMenuDialog = React.lazy(() => import('../../ui/dialogs/PauseMenuDialog'));
const SettingsDialog = React.lazy(() => import('../../ui/dialogs/SettingsDialog'));

export type GameLayoutProps = {
  canvas?: React.ReactNode;
  hud?: React.ReactNode;
  inspector?: React.ReactNode;
  panels?: React.ReactNode;
  mobileBreakpoint?: number;
  showDebugPanel?: boolean;
  className?: string;
};

const defaultBottomDock = (
  <div className="game-layout__bottom-dock">
    <GameGuidePanel />
    <SettlementBriefPanel />
    <EventLogPanel />
    <React.Suspense fallback={null}>
      <ProductionChainPanel />
    </React.Suspense>
    <WarehousePanel />
    <EconomyPanel />
    <React.Suspense fallback={null}>
      <ContentCodexPanel />
    </React.Suspense>
    <BuildingMenu />
  </div>
);

export function GameLayout({
  canvas = <GameCanvas />,
  hud,
  inspector = <InspectorPanel />,
  panels = defaultBottomDock,
  mobileBreakpoint = 760,
  showDebugPanel = IS_DEV,
  className,
}: GameLayoutProps) {
  const isMobile = useResponsiveLayout(mobileBreakpoint);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [dismissedVictory, setDismissedVictory] = React.useState(false);
  const gameState = useGameStore((state) => state.gameState);
  const isRunning = useGameStore((state) => state.isRunning);
  const activeScenario = useGameStore((state) => state.activeScenario);
  const setRunning = useGameStore((state) => state.setRunning);
  const resetGame = useGameStore((state) => state.resetGame);
  const setScenarioProfile = useGameStore((state) => state.setScenarioProfile);
  const focusMode = useUIStore((state) => state.focusMode);
  const minimalHud = useUIStore((state) => state.minimalHud);
  const guideOpen = useUIStore((state) => state.guideOpen);
  const outcome = React.useMemo(() => evaluateGameOutcome(gameState, player1Id), [gameState]);
  const visibleOutcome = outcome.kind === 'victory' && dismissedVictory ? { ...outcome, kind: 'in-progress' as const } : outcome;

  React.useEffect(() => {
    if (outcome.kind !== 'in-progress') {
      setRunning(false);
    }
  }, [outcome.kind, setRunning]);

  React.useEffect(() => {
    document.body.classList.toggle('ui--focus', focusMode);
    document.body.classList.toggle('ui--minimal', minimalHud);
    document.body.classList.toggle('ui--guide-open', guideOpen);
    return () => {
      document.body.classList.remove('ui--focus', 'ui--minimal', 'ui--guide-open');
    };
  }, [focusMode, guideOpen, minimalHud]);

  const handleRestart = React.useCallback(() => {
    setMenuOpen(false);
    setSettingsOpen(false);
    setDismissedVictory(false);
    resetGame();
  }, [resetGame]);

  const handleScenarioChange = React.useCallback((profile: typeof activeScenario) => {
    setDismissedVictory(false);
    setScenarioProfile(profile);
  }, [setScenarioProfile]);

  const resolvedHud = hud ?? (
    <TopHud
      onOpenMenu={() => setMenuOpen(true)}
      onOpenSettings={() => setSettingsOpen(true)}
    />
  );

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
      <SvgAnimationIntegrator />
      <Particles />
      <HudLayout top={resolvedHud} right={inspector} bottom={panels} isMobile={isMobile} />
      {showDebugPanel && (
        <div className="game-layout__debug-panel">
          <DebugLogisticsPanel />
        </div>
      )}
      <React.Suspense fallback={null}>
        <PauseMenuDialog
          open={menuOpen}
          isRunning={isRunning}
          onResume={() => {
            setRunning(true);
            setMenuOpen(false);
          }}
          onRestart={handleRestart}
          onOpenSettings={() => {
            setMenuOpen(false);
            setSettingsOpen(true);
          }}
          onClose={() => setMenuOpen(false)}
        />
        <SettingsDialog
          open={settingsOpen}
          activeScenario={activeScenario}
          onScenarioChange={handleScenarioChange}
          onClose={() => setSettingsOpen(false)}
        />
        <VictoryDialog
          outcome={visibleOutcome}
          onContinue={() => {
            setDismissedVictory(true);
            setRunning(true);
          }}
          onRestart={handleRestart}
        />
      </React.Suspense>
    </div>
  );
}
