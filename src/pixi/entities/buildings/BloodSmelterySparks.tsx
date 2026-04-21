import React from "react";

// @ts-ignore
import { Container, Sprite, Text, Graphics } from "@pixi/react";


export function BloodSmelterySparks({
  intensity,
}: {
  intensity: number;
}) {
  if (intensity <= 0.15) return null;

  return (
    <Graphics
      x={16}
      y={-62}
      draw={(g: any) => {
        g.clear();
        g.circle(-6, -3, 1.4).fill({ color: 0xffaa33, alpha: 0.9 });
        g.circle(3, -8, 1.1).fill({ color: 0xffdd88, alpha: 0.75 });
        g.circle(10, -2, 1.2).fill({ color: 0xff7722, alpha: 0.85 });
      }}
    />
  );
}
