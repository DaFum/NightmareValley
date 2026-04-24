import React from "react";
import { Container, Sprite } from "@pixi/react";
import { IsoBuildingRenderData } from "../../game/iso/iso.types";
import { useTextures } from "../utils/textureRegistry";

export interface IsoBuildingLayerProps {
  buildings: IsoBuildingRenderData[];
}

const BUILDING_SCALE = 0.28;
const BUILDING_ANCHOR = { x: 0.5, y: 1 } as const;
const CENTER_ANCHOR = { x: 0.5, y: 0.5 } as const;

export const IsoBuildingLayer: React.FC<IsoBuildingLayerProps> = ({ buildings }) => {
  const { registry } = useTextures();

  return (
    <>
      {buildings.map((building) => {
        const {
          id,
          screenX,
          screenY,
          zIndex,
          spriteKey,
          selected,
          hovered,
          state,
        } = building;

        const mainTex = registry.getTexture(spriteKey);
        const shadowTex = registry.getTexture("generic_building_shadow");
        const selectionTex = registry.getTexture("selection_ellipse_building");
        const hoverTex = registry.getTexture("hover_ellipse_building");

        return (
          <Container
            key={id}
            x={screenX}
            y={screenY}
            zIndex={zIndex}
            sortableChildren={true}
            eventMode="none"
          >
            {shadowTex ? (
              <Sprite texture={shadowTex} anchor={CENTER_ANCHOR} y={10} zIndex={0} alpha={0.3} scale={0.8} />
            ) : (
              <Sprite image="generic_building_shadow" anchor={CENTER_ANCHOR} y={10} zIndex={0} alpha={0.3} scale={0.8} />
            )}

            {selected && (
              selectionTex ? (
                <Sprite texture={selectionTex} anchor={CENTER_ANCHOR} y={10} zIndex={1} />
              ) : (
                <Sprite image="selection_ellipse_building" anchor={CENTER_ANCHOR} y={10} zIndex={1} />
              )
            )}
            {hovered && !selected && (
              hoverTex ? (
                <Sprite texture={hoverTex} anchor={CENTER_ANCHOR} y={10} zIndex={1} alpha={0.5} />
              ) : (
                <Sprite image="hover_ellipse_building" anchor={CENTER_ANCHOR} y={10} zIndex={1} alpha={0.5} />
              )
            )}

            {mainTex ? (
              <Sprite
                texture={mainTex}
                anchor={BUILDING_ANCHOR}
                y={16}
                scale={BUILDING_SCALE}
                zIndex={2}
                tint={state === "damaged" ? 0xddaaaa : 0xffffff}
              />
            ) : (
              <Sprite
                image={spriteKey}
                anchor={BUILDING_ANCHOR}
                y={16}
                scale={BUILDING_SCALE}
                zIndex={2}
                tint={state === "damaged" ? 0xddaaaa : 0xffffff}
              />
            )}
          </Container>
        );
      })}
    </>
  );
};
