import { Container } from '@pixi/react';
import IsoRoadSprite from '../entities/roads/IsoRoadSprite';

export default function IsoRoadLayer(): JSX.Element {
  return (
    <Container eventMode="none" sortableChildren={false} zIndex={26}>
      <IsoRoadSprite />
    </Container>
  );
}
