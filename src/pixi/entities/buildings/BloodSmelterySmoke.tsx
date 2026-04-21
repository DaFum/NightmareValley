import React from "react";

// @ts-ignore
import { Container, Sprite, Text, Graphics } from "@pixi/react";

import { BlurFilter } from "pixi.js";

export function BloodSmelterySmoke({
  intensity,
}: {
  intensity: number;
}) {
  if (intensity <= 0) return null;

  const blur = new BlurFilter({ strength: 6 });

  return (
    <Container x={18} y={-102} filters={[blur]}>
      <Graphics
        draw={(g: any) => {
          g.clear();
          g.circle(0, 0, 14).fill({ color: 0x777777, alpha: 0.22 * intensity });
          g.circle(10, -10, 12).fill({ color: 0x888888, alpha: 0.18 * intensity });
          g.circle(-8, -18, 10).fill({ color: 0x999999, alpha: 0.14 * intensity });
          g.circle(6, -26, 8).fill({ color: 0xaaaaaa, alpha: 0.1 * intensity });
        }}
      />
    </Container>
  );
}
