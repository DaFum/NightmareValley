import React from "react";

import { Container, Graphics } from "@pixi/react";

import { BlurFilter } from "pixi.js";

export function BloodSmelteryGlow({
  intensity,
}: {
  intensity: number;
}) {
  const blur = React.useMemo(() => {
    const f = new BlurFilter();
    f.blur = 0;
    return f;
  }, []);

  React.useEffect(() => {
    blur.blur = 10 * intensity;
  }, [intensity, blur]);

  React.useEffect(() => {
    return () => blur.destroy();
  }, [blur]);

  if (intensity <= 0) return null;

  return (
    <Container x={10} y={-56} filters={[blur]} eventMode="none">
      <Graphics
        draw={(g: any) => {
          g.clear();
          g.beginFill(0xff7a1a, 0.35 + intensity * 0.4)
           .drawEllipse(0, 0, 18 + intensity * 10, 8 + intensity * 4)
           .endFill();
          g.beginFill(0xffd060, 0.5 + intensity * 0.3)
           .drawEllipse(0, 0, 9 + intensity * 5, 4 + intensity * 2)
           .endFill();
        }}
      />
    </Container>
  );
}
