import React from 'react';

export default function FpsCounter(): JSX.Element {
  const [fps, setFps] = React.useState(0);

  React.useEffect(() => {
    let frame = 0;
    let raf = 0;
    let last = performance.now();

    const tick = (time: number) => {
      frame += 1;
      if (time - last >= 1000) {
        setFps(Math.round(frame * 1000 / (time - last)));
        frame = 0;
        last = time;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`status-chip ${fps < 45 ? 'status-chip--warn' : ''}`} aria-label="Frames per second">
      <span>FPS</span>
      <strong>{fps || '--'}</strong>
    </div>
  );
}

