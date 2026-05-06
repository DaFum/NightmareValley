import { Container } from '@pixi/react';
import type { IsoRenderWorld } from '../../game/render/render.types';
import IsoRoadSprite from '../entities/roads/IsoRoadSprite';

type IsoRoadLayerProps = {
  tiles: IsoRenderWorld['tiles'];
};

export default function IsoRoadLayer({ tiles }: IsoRoadLayerProps): JSX.Element {
  return (
    <Container eventMode="none" sortableChildren={false} zIndex={26}>
      <IsoRoadSprite tiles={tiles} />
    </Container>
  );
}
