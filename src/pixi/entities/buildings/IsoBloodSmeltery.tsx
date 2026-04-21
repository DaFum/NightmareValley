import React from "react";

// @ts-ignore
import { Container, Sprite, Text, Graphics } from "@pixi/react";

import { Texture } from "pixi.js";
import { RenderBloodSmeltery } from "../../../game/render/render.types";

import { BloodSmelteryShadow } from "./BloodSmelteryShadow";
import { BloodSmelteryStorage } from "./BloodSmelteryStorage";
import { BloodSmelteryGlow } from "./BloodSmelteryGlow";
import { BloodSmelterySmoke } from "./BloodSmelterySmoke";
import { BloodSmelterySparks } from "./BloodSmelterySparks";
import { BloodSmelteryStatus } from "./BloodSmelteryStatus";

type Props = {
  building: RenderBloodSmeltery;
  baseTexture: Texture;
};

export function IsoBloodSmeltery({ building, baseTexture }: Props) {
  return (
    <Container x={building.x} y={building.y} zIndex={building.zIndex}>
      <BloodSmelteryShadow />

      <Sprite
        texture={baseTexture}
        anchor={{ x: 0.5, y: 1 }}
        y={-96}
        tint={building.state === "damaged" ? 0xddaaaa : 0xffffff}
      />

      <BloodSmelteryStorage
        oreFill={building.oreFill}
        coalFill={building.coalFill}
        outputFill={building.outputFill}
      />

      <BloodSmelteryGlow intensity={building.fireIntensity} />
      <BloodSmelterySmoke intensity={building.smokeIntensity} />
      <BloodSmelterySparks intensity={building.fireIntensity} />
      <BloodSmelteryStatus state={building.state} />
    </Container>
  );
}
