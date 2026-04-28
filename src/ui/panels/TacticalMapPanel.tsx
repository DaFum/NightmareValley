import { useMemo } from 'react';
import { createTacticalMapSummary, projectTacticalPoint } from '../../game/map/tactical-map';
import type { TerrainType } from '../../game/core/economy.types';
import { player1Id, useGameStore } from '../../store/game.store';

const MAP_WIDTH = 188;
const MAP_HEIGHT = 132;

const TERRAIN_CLASS: Record<TerrainType, string> = {
  scarredEarth: 'tactical-map__tile--earth',
  weepingForest: 'tactical-map__tile--forest',
  ribMountain: 'tactical-map__tile--mountain',
  placentaLake: 'tactical-map__tile--water',
  scarPath: 'tactical-map__tile--road',
  occupiedScar: 'tactical-map__tile--occupied',
  ashBog: 'tactical-map__tile--bog',
  cathedralRock: 'tactical-map__tile--rock',
};

export default function TacticalMapPanel(): JSX.Element {
  const mapBucket = useGameStore((state) => Math.floor(state.gameState.ageOfTeeth / 2));
  const summary = useMemo(
    () => createTacticalMapSummary(useGameStore.getState().gameState, player1Id),
    [mapBucket]
  );

  const tileWidth = Math.max(2.5, MAP_WIDTH / summary.bounds.width);
  const tileHeight = Math.max(2.5, MAP_HEIGHT / summary.bounds.height);

  return (
    <section className="tactical-map macabre-panel" aria-label="Tactical map">
      <div className="tactical-map__header">
        <div>
          <span className="panel-kicker">Map</span>
          <h2>Tactical Overview</h2>
        </div>
        <strong>{summary.counts.ownedTiles}</strong>
      </div>
      <svg
        className="tactical-map__svg"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={`${summary.counts.buildings} buildings, ${summary.counts.roads} roads, ${summary.counts.workers} workers`}
      >
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} className="tactical-map__void" />
        {summary.terrain.map((tile) => {
          const point = projectTacticalPoint(tile.x, tile.y, summary, MAP_WIDTH, MAP_HEIGHT);
          return (
            <rect
              key={tile.id}
              className={[
                'tactical-map__tile',
                TERRAIN_CLASS[tile.terrain],
                tile.owned ? 'tactical-map__tile--owned' : '',
              ].filter(Boolean).join(' ')}
              x={point.x}
              y={point.y}
              width={tileWidth}
              height={tileHeight}
              rx="0.8"
            />
          );
        })}
        {summary.points.map((point) => {
          const projected = projectTacticalPoint(point.x, point.y, summary, MAP_WIDTH, MAP_HEIGHT);
          const radius = point.kind === 'building' ? 2.4 : point.kind === 'worker' ? 1.6 : 1.1;
          return (
            <circle
              key={point.id}
              className={[
                'tactical-map__point',
                `tactical-map__point--${point.kind}`,
                point.active ? 'tactical-map__point--active' : '',
              ].filter(Boolean).join(' ')}
              cx={projected.x + tileWidth / 2}
              cy={projected.y + tileHeight / 2}
              r={radius}
            />
          );
        })}
      </svg>
      <dl className="tactical-map__stats">
        <div><dt>Build</dt><dd>{summary.counts.buildings}</dd></div>
        <div><dt>Road</dt><dd>{summary.counts.roads}</dd></div>
        <div><dt>Move</dt><dd>{summary.counts.activeCarriers}</dd></div>
      </dl>
    </section>
  );
}
