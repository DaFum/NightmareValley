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
  } = data;

  // Since the manifest doesn't register detailed variants/animations for workers,
  // we look up the base worker name statically registered in the registry.
  const baseTexture = `worker_${type}`;

  const getCarryTexture = () => {
    if (!carrying) return null;

    const CARRY_MAP: Record<string, string> = {
      sinewTimber: "wood",
      toothPlanks: "wood",
      sepulcherStone: "stone",
      veinIronOre: "stone",
      cathedralGoldOre: "stone",
      veinIronBar: "stone",
      haloGoldBar: "stone",
      graveCoal: "stone"
    };

    const group = CARRY_MAP[carrying] || "generic";
    return `carry_${group}_${dir}`;
  };

  const getToolTexture = () => {
    if (!tool) return null;
    if (animation === "work" || animation === "walk") {
      return `tool_${tool}_${dir}`;
    }
    return null;
  };

  const toolTex = getToolTexture();
  const carryTex = getCarryTexture();

  return (
    <Container x={screenX} y={screenY} zIndex={zIndex} sortableChildren={true} eventMode="none">
      <Sprite image="generic_worker_shadow" anchor={0.5} y={5} zIndex={0} alpha={0.3} />

      {selected && (
        <Sprite image="selection_ellipse_worker" anchor={0.5} y={5} zIndex={1} />
      )}
      {hovered && !selected && (
        <Sprite image="hover_ellipse_worker" anchor={0.5} y={5} zIndex={1} alpha={0.5} />
      )}

      <Sprite image={baseTexture} anchor={0.5} zIndex={2} />

      {toolTex && (
        <Sprite image={toolTex} anchor={0.5} zIndex={3} />
      )}

      {carryTex && (
        <Sprite image={carryTex} anchor={0.5} zIndex={4} />
      )}
    </Container>
  );
};
