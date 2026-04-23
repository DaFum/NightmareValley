import React from "react";


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
        g.beginFill(0xffaa33, 0.9).drawCircle(-6, -3, 1.4).endFill();
        g.beginFill(0xffdd88, 0.75).drawCircle(3, -8, 1.1).endFill();
        g.beginFill(0xff7722, 0.85).drawCircle(10, -2, 1.2).endFill();
      }}
    />
  );
}
