import { Graphics } from "@pixi/react";

export function BloodSmelteryShadow() {
  return (
    <Graphics
      draw={(g: any) => {
        g.clear();
        g.beginFill(0x000000, 0.25).drawEllipse(0, 22, 72, 26).endFill();
        g.beginFill(0x000000, 0.12).drawEllipse(18, 24, 24, 10).endFill();
      }}
    />
  );
}
