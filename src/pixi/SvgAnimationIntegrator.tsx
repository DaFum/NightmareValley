import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import imageMap from './utils/vite-asset-loader';
import { useTextures } from './utils/textureRegistry';

const TERRAIN_PREFIX = 'terrain_';
const TILE_W = 128; // native SVG art width in px (manifest)
const TILE_H = 144; // native SVG art height in px (manifest)

function looksAnimated(svgText: string) {
  if (!svgText) return false;
  const lower = svgText.toLowerCase();
  return lower.includes('<animate') || lower.includes('@keyframes') || lower.includes('animation:');
}

export default function SvgAnimationIntegrator(): null {
  const { ready } = useTextures();

  useEffect(() => {
    if (!ready) return;

    let mounted = true;
    const cancelFns: (() => void)[] = [];
    const replacedKeys = new Set<string>();

    try {
      const keys = Object.keys((PIXI.utils as any).TextureCache ?? {});

      const terrainKeys = keys.filter((k) => typeof k === 'string' && k.startsWith(TERRAIN_PREFIX));

      terrainKeys.forEach((key) => {
        if (!mounted) return;

        // derive relative asset path used by vite-asset-loader
        const rel = `terrain/${key.replace(TERRAIN_PREFIX, '')}.svg`;
        const url = (imageMap as Record<string, string>)[rel];
        if (!url) return; // not an svg we can resolve

        // Fetch SVG text to detect animation markers. Non-critical if this fails.
        fetch(url)
          .then((r) => r.text())
          .then((txt) => {
            if (!mounted) return;
            if (!looksAnimated(txt)) return;

            // Only replace once per texture key
            if (replacedKeys.has(key)) return;
            replacedKeys.add(key);

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;

            img.onload = () => {
              if (!mounted) return;
              const w = img.naturalWidth || TILE_W;
              const h = img.naturalHeight || TILE_H;
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;

              let rafId: number | null = null;

              cancelFns.push(() => {
                if (rafId !== null) window.cancelAnimationFrame(rafId);
              });

              // Create texture once outside the loop
              let baseTex: PIXI.BaseTexture | null = null;
              try {
                baseTex = new PIXI.BaseTexture(canvas);
                const tex = new PIXI.Texture(baseTex);
                try { delete (PIXI.utils as any).TextureCache[key]; } catch (e) { /* ignore */ }
                PIXI.Texture.addToCache(tex, key);
              } catch (e) {
                // Ignore initial texture swap errors
              }

              // Drawing loop: copy the live <img> (which runs SVG animations) into canvas
              const draw = () => {
                if (!mounted) return;
                try {
                  ctx.clearRect(0, 0, w, h);
                  ctx.drawImage(img, 0, 0, w, h);

                  if (baseTex) {
                    baseTex.update();
                  }
                } catch (err) {
                  // ignore draw errors
                }

                rafId = window.requestAnimationFrame(draw);
              };

              // Start loop
              draw();
            };

            img.onerror = () => {
              // Loading failed; skip
            };
          })
          .catch(() => {
            // ignore fetch errors
          });
      });
    } catch (err) {
      // ignore unexpected errors
      // eslint-disable-next-line no-console
      console.error('SvgAnimationIntegrator unexpected error', err);
    }

    return () => {
      mounted = false;
      cancelFns.forEach((fn) => fn());
    };
  }, [ready]);

  return null;
}
