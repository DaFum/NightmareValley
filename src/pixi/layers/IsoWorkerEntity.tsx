import React from "react";
// @ts-ignore
import { Container, Sprite } from "@pixi/react";
import { IsoWorkerRenderData } from "../../game/iso/iso.types";

export interface IsoWorkerEntityProps {
  data: IsoWorkerRenderData;
}

export const IsoWorkerEntity: React.FC<IsoWorkerEntityProps> = ({ data }) => {
  const {
    screenX,
    screenY,
    zIndex,
    type,
    dir,
    animation,
    carrying,
    tool,
    selected,
    hovered,
    variant,
  } = data;

  // The base texture name depends on type, variant, animation, and direction
  const baseTexture = `worker_${type}_v${variant}_${animation}_${dir}`;

  const getCarryTexture = () => {
    if (!carrying) return null;

    // Group logic could be mapped here (e.g. "wood-like", "stone-like")
    // For now we just map the raw resource type or a group based on it
    if (carrying.includes("Timber") || carrying.includes("Plank")) {
        return `carry_wood_${dir}`;
    }
    if (carrying.includes("Stone") || carrying.includes("Ore")) {
        return `carry_stone_${dir}`;
    }
    return `carry_generic_${dir}`;
  };

  const getToolTexture = () => {
    if (!tool) return null;
    // Tools are only visibly held during certain animations
    if (animation === "work" || animation === "walk") {
      return `tool_${tool}_${dir}`;
    }
    return null;
  };

  return (
    <Container x={screenX} y={screenY} zIndex={zIndex} sortableChildren={true}>
      {/* 1. Shadow Layer */}
      <Sprite image="generic_worker_shadow" anchor={0.5} y={5} zIndex={0} alpha={0.3} />

      {/* 2. Selection Marker */}
      {selected && (
        <Sprite image="selection_ellipse_worker" anchor={0.5} y={5} zIndex={1} />
      )}
      {hovered && !selected && (
        <Sprite image="hover_ellipse_worker" anchor={0.5} y={5} zIndex={1} alpha={0.5} />
      )}

      {/* 3. Main Body Layer */}
      <Sprite image={baseTexture} anchor={0.5} zIndex={2} />

      {/* 4. Tool Layer */}
      {getToolTexture() && (
        <Sprite image={getToolTexture()!} anchor={0.5} zIndex={3} />
      )}

      {/* 5. Carry Layer */}
      {getCarryTexture() && (
        <Sprite image={getCarryTexture()!} anchor={0.5} zIndex={4} />
      )}
    </Container>
  );
};
