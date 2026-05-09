import { useState } from 'react';
import { Container, Graphics, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useTextures } from '../utils/textureRegistry';
import { IsoRenderWorld } from '../../game/render/render.types';
import { useSelectionStore } from '../../store/selection.store';
import { resourceLabel } from '../../store/economy.utils';

interface IsoWorkerLayerProps {
  workers: IsoRenderWorld['workers'];
}

const WORKER_SCALE = 0.18;
const WORKER_ANCHOR = { x: 0.5, y: 1 } as const;

const WORKER_LABEL_STYLE = new PIXI.TextStyle({
  fill: '#e3dcd3',
  fontFamily: 'Georgia, serif',
  fontSize: 11,
  stroke: '#080305',
  strokeThickness: 3,
});
// Carry sprite is proportionally larger and offset upward relative to the worker scale
const CARRY_SCALE = WORKER_SCALE * (0.2 / 0.13);
const CARRY_OFFSET_Y = -Math.round(16 * (WORKER_SCALE / 0.13));

export function IsoWorkerLayer({ workers }: IsoWorkerLayerProps) {
  const { registry } = useTextures();
  const selectWorker = useSelectionStore((state) => state.selectWorker);
  const [hoveredWorkerId, setHoveredWorkerId] = useState<string | null>(null);

  // No need to sort if the parent Container has sortableChildren=true,
  // but we must set the zIndex on the sprites.

  return (
    <>
      {workers.map((worker) => {
        // The manifest registers workers as `worker_<type>` (flat files),
        // so prefer that base key. Animated variant keys are not available
        // in the current sheets, so fall back to the base worker texture.
        const baseKey = `worker_${worker.type}`;
        const fallbackKey = 'worker_burdenThrall';

        const texture = registry.getTexture(baseKey) || registry.getTexture(fallbackKey);

        if (!texture) return null;

        const carryingTex = worker.carrying ? registry.getTexture(`resource_${worker.carrying}`) : undefined;
        const isFocused = worker.selected || hoveredWorkerId === worker.id;
        const workerLabel = worker.carrying
          ? `${resourceLabel(worker.carrying)} -> delivery`
          : worker.state === 'idle'
            ? 'Idle carrier'
            : worker.state;

        return (
          <Container
            key={worker.id}
            x={worker.screenX}
            y={worker.screenY}
            zIndex={worker.zIndex}
            sortableChildren={true}
            eventMode="static"
            cursor="pointer"
            pointerdown={(event: PIXI.FederatedPointerEvent) => {
              event.stopPropagation();
              selectWorker(worker.id);
            }}
            pointerover={() => setHoveredWorkerId(worker.id)}
            pointerout={() => setHoveredWorkerId((current) => current === worker.id ? null : current)}
          >
            <Graphics
              zIndex={-1}
              draw={(graphics) => {
                graphics.clear();
                graphics.lineStyle(isFocused ? 2 : 1, isFocused ? 0x7ee787 : 0xd8cdbf, isFocused ? 0.95 : 0.45);
                graphics.beginFill(worker.state === 'carrying' ? 0x4d9de0 : 0x0b0b0d, isFocused ? 0.18 : 0.08);
                graphics.drawEllipse(0, -4, isFocused ? 14 : 10, isFocused ? 7 : 5);
                graphics.endFill();
              }}
            />
            <Sprite
              texture={texture}
              anchor={WORKER_ANCHOR}
              scale={WORKER_SCALE}
              zIndex={0}
            />
            {carryingTex && (
              <Sprite
                texture={carryingTex}
                anchor={{ x: 0.5, y: 1 }}
                y={CARRY_OFFSET_Y}
                scale={CARRY_SCALE}
                zIndex={1}
              />
            )}
            {isFocused && (
              <Text
                text={workerLabel}
                x={0}
                y={-42}
                anchor={{ x: 0.5, y: 1 }}
                zIndex={2}
                style={WORKER_LABEL_STYLE}
              />
            )}
          </Container>
        );
      })}
    </>
  );
}
