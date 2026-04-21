import React from "react";

// @ts-ignore
import { Container, Sprite, Text, Graphics } from "@pixi/react";

import { BlurFilter } from "pixi.js";

export function BloodSmelteryGlow({
  intensity,
}: {
  intensity: number;
}) {
  if (intensity <= 0) return null;

  const blur = React.useMemo(() => new BlurFilter({ strength: 0 }), []);

  React.useEffect(() => {
    blur.strength = 10 * intensity;
  }, [intensity, blur]);

  React.useEffect(() => {
    return () => blur.destroy();
  }, [blur]);

  return (
    <Container x={10} y={-56} // @ts-ignore
    filters={[blur]}>
      <Graphics
        draw={(g: any) => {
          g.clear();
          g.ellipse(0, 0, 18 + intensity * 10, 8 + intensity * 4).fill({
            color: 0xff7a1a,
            alpha: 0.35 + intensity * 0.4,
          });
          g.ellipse(0, 0, 9 + intensity * 5, 4 + intensity * 2).fill({
            color: 0xffd060,
            alpha: 0.5 + intensity * 0.3,
          });
        }}
      />
    </Container>
  );
}
