import React, { useEffect, useRef } from 'react';

export default function Particles(): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const pc = ref.current;
    if (!pc) return;

    const timeouts = new Set<number>();

    function spawnParticle() {
      const container = ref.current;
      if (!container) return;

      const p = document.createElement('div');
      p.className = 'particle';

      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight * 0.35 + Math.random() * window.innerHeight * 0.65;
      const r = 140 + (Math.random() * 65 | 0);
      const g = 8 + (Math.random() * 15 | 0);
      const b = 8 + (Math.random() * 10 | 0);
      const dur = 5 + Math.random() * 7;

      // Position + sizing
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      const size = 1 + Math.random() * 2.2;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;

      // Visuals + animation timing
      p.style.background = `rgba(${r},${g},${b},.62)`;
      p.style.animationDuration = `${dur}s`;
      p.style.animationDelay = `${Math.random() * 2}s`;

      container.appendChild(p);
      const t = window.setTimeout(() => {
        p.remove();
        timeouts.delete(t);
      }, (dur + 2) * 1000);
      timeouts.add(t);
    }

    // start spawning regularly
    const intervalId = window.setInterval(spawnParticle, 480);

    // seed a few particles immediately for visual rhythm
    for (let i = 0; i < 3; i++) {
      const t = window.setTimeout(() => {
        spawnParticle();
        timeouts.delete(t);
      }, i * 180);
      timeouts.add(t as unknown as number);
    }

    return () => {
      window.clearInterval(intervalId);
      timeouts.forEach((id) => window.clearTimeout(id));
      if (ref.current) ref.current.innerHTML = '';
    };
  }, []);

  return (
    <div id="particles" className="particles" ref={ref} />
  );
}
