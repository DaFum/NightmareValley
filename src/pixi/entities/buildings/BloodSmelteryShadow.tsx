import React from "react";
import { Graphics } from "@pixi/react";

export function BloodSmelteryShadow() {
  return (
    <Graphics
      draw={(g: any) => {
        g.clear();
        g.ellipse(0, 22, 72, 26).fill({ color: 0x000000, alpha: 0.25 });
        g.ellipse(18, 24, 24, 10).fill({ color: 0x000000, alpha: 0.12 });
      }}
    />
  );
}
