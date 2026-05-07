import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../../store/game.store';
import { getProfilerStats } from '../../lib/profiler';
import { createRandom } from '../../game/core/random';
import { findPath, calculatePathDistance } from '../../game/pathing/path.a-star';
import { createGridFromTerritory } from '../../game/pathing/path.grid';
import { debugPath } from '../../game/pathing/path.debug';
import { buildFlowfield } from '../../game/pathing/path.flowfield';

const IS_DEV = __DEV__;

export default function MapDebugPanel(): JSX.Element | null {
  const gameState = useGameStore((state) => state.gameState);
  const [seedText, setSeedText] = useState('1337');

  const stats = useMemo(() => getProfilerStats(), [gameState.tick]);
  const entries = Object.entries(stats);

  const parsedSeed = Number(seedText);
  const rngPreview = useMemo(() => {
    if (!Number.isFinite(parsedSeed)) return null;
    const rng = createRandom(parsedSeed);
    return [rng.int(1000), rng.int(1000), rng.int(1000)];
  }, [parsedSeed]);

  const pathDiagnostics = useMemo(() => {
    if (!IS_DEV) return null;
    const tiles = Object.values(gameState.territory.tiles);
    if (tiles.length < 2) return null;

    const start = tiles[0].position;
    const goal = tiles[Math.min(tiles.length - 1, 30)].position;
    const path = findPath(start, goal, gameState);
    const maxX = tiles.reduce((max, tile) => Math.max(max, tile.position.x), 0) + 1;
    const maxY = tiles.reduce((max, tile) => Math.max(max, tile.position.y), 0) + 1;
    const flow = buildFlowfield(goal, createGridFromTerritory(gameState.territory, maxX, maxY));

    return {
      path,
      points: path.points.length,
      distance: calculatePathDistance(path),
      complete: path.isComplete,
      flowCostAtStart: flow.dist[start.y * flow.width + start.x] ?? null,
    };
  }, [gameState]);

  useEffect(() => {
    if (!pathDiagnostics?.path) return;
    debugPath(pathDiagnostics.path);
  }, [pathDiagnostics?.path]);

  if (!IS_DEV) return null;

  return (
    <div className="macabre-panel" style={{ padding: '0.75rem', color: 'white' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Profiler & Path Debug</h3>

      <label style={{ display: 'block', marginBottom: '0.5rem' }}>
        RNG seed
        <input
          value={seedText}
          onChange={(event) => setSeedText(event.target.value)}
          style={{ marginLeft: '0.5rem', width: '8rem' }}
        />
      </label>
      <div style={{ marginBottom: '0.5rem' }}>
        RNG preview: {rngPreview ? rngPreview.join(', ') : 'invalid seed'}
      </div>

      {pathDiagnostics ? (
        <div style={{ marginBottom: '0.5rem' }}>
          <div>Path points: {pathDiagnostics.points}</div>
          <div>Path distance: {Math.round(pathDiagnostics.distance * 100) / 100}</div>
          <div>Path complete: {pathDiagnostics.complete ? 'yes' : 'no'}</div>
          <div>Flowfield start cost: {pathDiagnostics.flowCostAtStart ?? 'n/a'}</div>
        </div>
      ) : null}

      {entries.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
          {entries.map(([name, entry]) => (
            <li key={name}>{name}: {entry.ms}ms (samples: {entry.samples})</li>
          ))}
        </ul>
      ) : (
        <div>No profiler samples yet.</div>
      )}
    </div>
  );
}
