import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { TransportState } from '../../game/economy/transport.logic';
import { tileToScreen } from '../../game/iso/iso.project';

type IsoRoadLayerProps = {
  roads: TransportState['roadNodes'];
};

export default function IsoRoadLayer({ roads }: IsoRoadLayerProps): JSX.Element | null {
  const drawRoads = useCallback((g: PIXI.Graphics) => {
    g.clear();

    const nodes = Object.values(roads);
    const seen = new Set<string>();

    for (const node of nodes) {
      const from = tileToScreen(node.position.x, node.position.y, 64, 32);

      for (const targetId of node.connectedNodeIds) {
        const target = roads[targetId];
        if (!target) continue;

        const signature = [node.id, target.id].sort().join(':');
        if (seen.has(signature)) continue;
        seen.add(signature);

        const to = tileToScreen(target.position.x, target.position.y, 64, 32);

        g.lineStyle(7, 0x301113, 0.88);
        g.moveTo(from.x, from.y + 7);
        g.lineTo(to.x, to.y + 7);
        g.lineStyle(3, 0x8f2730, 0.88);
        g.moveTo(from.x, from.y + 7);
        g.lineTo(to.x, to.y + 7);
      }

      g.beginFill(0xb33a44, 0.85);
      g.drawCircle(from.x, from.y + 7, 4);
      g.endFill();
    }
  }, [roads]);

  return <Graphics draw={drawRoads} zIndex={5} eventMode="none" />;
}

