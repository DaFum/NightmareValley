import React, { useEffect } from 'react';
import { Container } from '@pixi/react';
import { WorldViewport } from './world/WorldViewport';
import { WorldRoot } from './world/WorldRoot';
import { useGameLoop } from './hooks/useGameLoop';
import { useIsoCamera } from './hooks/useIsoCamera';
import { useGameStore } from '../store/game.store';
import { useCameraStore } from '../store/camera.store';

export function GameStage() {
  // Setup logic hooks
  useGameLoop();
  useIsoCamera();

  const togglePlayPause = useGameStore((state) => state.togglePlayPause);
  const isRunning = useGameStore((state) => state.isRunning);
  const setCameraPosition = useCameraStore((state) => state.setCameraPosition);

  useEffect(() => {
    // Start simulation immediately if not running
    // Use useGameStore.getState() to avoid dependency on isRunning/togglePlayPause in the useEffect
    const currentState = useGameStore.getState();
    if (!currentState.isRunning) {
      currentState.togglePlayPause();
    }

    // Center camera on screen initialization
    setCameraPosition(window.innerWidth / 2, window.innerHeight / 2);
  }, [setCameraPosition]);

  return (
    <WorldViewport>
      <WorldRoot />
    </WorldViewport>
  );
}
