import React from "react";

// @ts-ignore
import { Container, Sprite, Text, Graphics } from "@pixi/react";

import { BlurFilter } from "pixi.js";

export function BloodSmelterySmoke({
  intensity,
}: {
  intensity: number;
}) {
  const blur = React.useMemo(() => {
    const f = new BlurFilter();
    f.blur = 6;
    return f;
  }, []);

  React.useEffect(() => {
    return () => blur.destroy();
  }, [blur]);

  if (intensity <= 0) return null;

  return (
    <Container x={18} y={-102} // @ts-ignore
    filters={[blur]}>
      <Graphics
        draw={(g: any) => {
          g.clear();
          g.beginFill(0x777777, 0.22 * intensity).drawCircle(0, 0, 14).endFill();
          g.beginFill(0x888888, 0.18 * intensity).drawCircle(10, -10, 12).endFill();
          g.beginFill(0x999999, 0.14 * intensity).drawCircle(-8, -18, 10).endFill();
          g.beginFill(0xaaaaaa, 0.1 * intensity).drawCircle(6, -26, 8).endFill();
        }}
      />
    </Container>
  );
}
