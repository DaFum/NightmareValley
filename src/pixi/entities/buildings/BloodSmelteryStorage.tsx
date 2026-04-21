import React from "react";

// @ts-ignore
import { Container, Sprite, Text, Graphics } from "@pixi/react";


function pileSize(fill: number) {
  if (fill <= 0) return 0;
  if (fill < 0.34) return 1;
  if (fill < 0.67) return 2;
  return 3;
}

export function BloodSmelteryStorage({
  oreFill,
  coalFill,
  outputFill,
}: {
  oreFill: number;
  coalFill: number;
  outputFill: number;
}) {
  const ore = pileSize(oreFill);
  const coal = pileSize(coalFill);
  const bars = pileSize(outputFill);

  return (
    <Container>
      {ore > 0 && (
        <Graphics
          x={-34}
          y={-10}
          draw={(g: any) => {
            g.clear();
            for (let i = 0; i < ore + 2; i++) {
              g.circle(i * 5, -i, 4 + ore).fill({ color: 0x7b3c3c, alpha: 0.95 });
            }
          }}
        />
      )}

      {coal > 0 && (
        <Graphics
          x={-4}
          y={2}
          draw={(g: any) => {
            g.clear();
            for (let i = 0; i < coal + 2; i++) {
              g.circle(i * 4, -i, 3 + coal).fill({ color: 0x2a2a2a, alpha: 1 });
            }
          }}
        />
      )}

      {bars > 0 && (
        <Graphics
          x={36}
          y={-6}
          draw={(g: any) => {
            g.clear();
            for (let i = 0; i < bars + 1; i++) {
              g.roundRect(i * 6, -i * 3, 14, 5, 1).fill({
                color: 0xd7a048,
                alpha: 0.98,
              });
            }
          }}
        />
      )}
    </Container>
  );
}
