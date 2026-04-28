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
import ResumeRunPrompt from '../../ui/panels/ResumeRunPrompt';
import { BuildingMenu } from '../../ui/panels/BuildingMenu';
import { HudLayout } from './HudLayout';
import Particles from '../../components/Particles';
import SvgAnimationIntegrator from '../../pixi/SvgAnimationIntegrator';
import { useResponsiveLayout } from './useResponsiveLayout';
import { evaluateGameOutcome } from '../../game/core/victory.rules';
import { player1Id, useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';
import { useSelectionStore } from '../../store/selection.store';
import ShortcutHelpDialog from '../../ui/dialogs/ShortcutHelpDialog';
import { getGameHotkeyAction } from '../../ui/hotkeys/gameHotkeys';

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
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [resumePromptDismissed, setResumePromptDismissed] = React.useState(false);
  const [dismissedVictory, setDismissedVictory] = React.useState(false);
  const gameState = useGameStore((state) => state.gameState);
  const isRunning = useGameStore((state) => state.isRunning);
  const activeScenario = useGameStore((state) => state.activeScenario);
  const setRunning = useGameStore((state) => state.setRunning);
  const togglePlayPause = useGameStore((state) => state.togglePlayPause);
  const resetGame = useGameStore((state) => state.resetGame);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadSavedGame = useGameStore((state) => state.loadSavedGame);
  const clearSavedGame = useGameStore((state) => state.clearSavedGame);
  const hasSavedGame = useGameStore((state) => state.hasSavedGame);
  const setScenarioProfile = useGameStore((state) => state.setScenarioProfile);
  const focusMode = useUIStore((state) => state.focusMode);
  const minimalHud = useUIStore((state) => state.minimalHud);
  const guideOpen = useUIStore((state) => state.guideOpen);
  const autosaveEnabled = useUIStore((state) => state.autosaveEnabled);
  const setAutosaveEnabled = useUIStore((state) => state.setAutosaveEnabled);
  const toggleAutosaveEnabled = useUIStore((state) => state.toggleAutosaveEnabled);
  const togglePanel = useUIStore((state) => state.togglePanel);
  const toggleRoadPlacementMode = useUIStore((state) => state.toggleRoadPlacementMode);
  const toggleRoadRemovalMode = useUIStore((state) => state.toggleRoadRemovalMode);
  const toggleGuideOpen = useUIStore((state) => state.toggleGuideOpen);
  const toggleMinimalHud = useUIStore((state) => state.toggleMinimalHud);
  const selectBuildingToPlace = useUIStore((state) => state.selectBuildingToPlace);
  const setRoadPlacementMode = useUIStore((state) => state.setRoadPlacementMode);
  const setRoadRemovalMode = useUIStore((state) => state.setRoadRemovalMode);
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  const outcome = React.useMemo(() => evaluateGameOutcome(gameState, player1Id), [gameState]);
  const visibleOutcome = outcome.kind === 'victory' && dismissedVictory ? { ...outcome, kind: 'in-progress' as const } : outcome;
  const savedGameAvailable = hasSavedGame();
  const showResumePrompt = savedGameAvailable && gameState.tick === 0 && !resumePromptDismissed && !menuOpen && !settingsOpen && !shortcutsOpen;

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

  React.useEffect(() => {
    if (!autosaveEnabled) return;

    const saveCurrentRun = () => {
      useGameStore.getState().saveGame();
    };
    const intervalId = window.setInterval(saveCurrentRun, 15_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveCurrentRun();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', saveCurrentRun);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', saveCurrentRun);
    };
  }, [autosaveEnabled]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = getGameHotkeyAction(event);
      if (!action) return;
      event.preventDefault();

      if (action === 'togglePlayPause') {
        togglePlayPause();
      } else if (action === 'toggleBuildMenu') {
        togglePanel('buildingMenu');
      } else if (action === 'toggleRoadBuild') {
        toggleRoadPlacementMode();
      } else if (action === 'toggleRoadRemove') {
        toggleRoadRemovalMode();
      } else if (action === 'toggleGuide') {
        toggleGuideOpen();
      } else if (action === 'toggleMinimalHud') {
        toggleMinimalHud();
      } else if (action === 'openShortcutHelp') {
        setShortcutsOpen(true);
      } else if (action === 'cancelOrClose') {
        if (shortcutsOpen) {
          setShortcutsOpen(false);
        } else if (settingsOpen) {
          setSettingsOpen(false);
        } else if (menuOpen) {
          setMenuOpen(false);
        } else {
          selectBuildingToPlace(null);
          setRoadPlacementMode(false);
          setRoadRemovalMode(false);
          clearSelection();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    clearSelection,
    menuOpen,
    selectBuildingToPlace,
    setRoadPlacementMode,
    setRoadRemovalMode,
    settingsOpen,
    shortcutsOpen,
    toggleGuideOpen,
    toggleMinimalHud,
    togglePanel,
    togglePlayPause,
    toggleRoadPlacementMode,
    toggleRoadRemovalMode,
  ]);

  const handleRestart = React.useCallback(() => {
    setMenuOpen(false);
    setSettingsOpen(false);
    setShortcutsOpen(false);
    setDismissedVictory(false);
    resetGame();
  }, [resetGame]);

  const handleResumeSavedRun = React.useCallback(() => {
    if (loadSavedGame()) {
      setDismissedVictory(false);
      setResumePromptDismissed(true);
    }
  }, [loadSavedGame]);

  const handleStartFreshRun = React.useCallback(() => {
    clearSavedGame();
    setAutosaveEnabled(false);
    setResumePromptDismissed(true);
    resetGame();
  }, [clearSavedGame, resetGame, setAutosaveEnabled]);

  const handleScenarioChange = React.useCallback((profile: typeof activeScenario) => {
    setDismissedVictory(false);
    setScenarioProfile(profile);
  }, [setScenarioProfile]);

  const resolvedHud = hud ?? (
    <TopHud
      onOpenMenu={() => setMenuOpen(true)}
      onOpenSettings={() => setSettingsOpen(true)}
      onOpenShortcuts={() => setShortcutsOpen(true)}
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
      <ResumeRunPrompt
        visible={showResumePrompt}
        onResume={handleResumeSavedRun}
        onNewRun={handleStartFreshRun}
        onDismiss={() => setResumePromptDismissed(true)}
      />
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
          onSave={() => {
            saveGame();
            setAutosaveEnabled(true);
            setMenuOpen(false);
          }}
          onLoad={() => {
            handleResumeSavedRun();
            setMenuOpen(false);
          }}
          onClearSave={() => {
            clearSavedGame();
            setAutosaveEnabled(false);
            setMenuOpen(false);
          }}
          onToggleAutosave={toggleAutosaveEnabled}
          onClose={() => setMenuOpen(false)}
          hasSavedGame={savedGameAvailable}
          autosaveEnabled={autosaveEnabled}
        />
        <SettingsDialog
          open={settingsOpen}
          activeScenario={activeScenario}
          onScenarioChange={handleScenarioChange}
          onClose={() => setSettingsOpen(false)}
        />
        <ShortcutHelpDialog
          open={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
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
