import React from "react";

// @ts-ignore
import { Container, Sprite, Text, Graphics } from "@pixi/react";

import * as PIXI from "pixi.js";
import { RenderBloodSmeltery } from "../../../game/render/render.types";

export function BloodSmelteryStatus({
  state,
}: {
  state: RenderBloodSmeltery["state"];
}) {
  let label: string | null = null;

  if (state === "waitingForCoal") label = "NO COAL";
  if (state === "waitingForOre") label = "NO ORE";
  if (state === "outputBlocked") label = "FULL";
  if (state === "upgrading") label = "UP";
  if (state === "damaged") label = "DMG";

  if (!label) return null;

  return (
    <Container y={-112}>
      <Graphics
        draw={(g: any) => {
          g.clear();
          g.roundRect(-26, -10, 52, 20, 6).fill({ color: 0x111111, alpha: 0.85 });
          g.roundRect(-26, -10, 52, 20, 6).stroke({ color: 0xff5533, width: 1 });
        }}
      />
      <Text
        text={label}
        anchor={0.5}
        style={
          // @ts-ignore
          new PIXI.TextStyle({
            fill: 0xffffff,
            fontSize: 10,
            fontWeight: "bold",
          }) as any
        }
      />
    </Container>
  );
}
