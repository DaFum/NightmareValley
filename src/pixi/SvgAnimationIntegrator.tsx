import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import imageMap from './utils/vite-asset-loader';
import { useTextures } from './utils/textureRegistry';

const TERRAIN_PREFIX = 'terrain_';
const TILE_W = 128; // native SVG art width in px (manifest)
const TILE_H = 144; // native SVG art height in px (manifest)

function looksAnimated(svgText: string) {
  if (!svgText) return false;
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const hasAnimationElements = doc.querySelectorAll('animate, animateMotion, animateTransform, set').length > 0;

  let hasCSSAnimation = false;
  const styles = doc.querySelectorAll('style');
  styles.forEach(style => {
    const text = style.textContent || '';
    if (/@keyframes/.test(text)) hasCSSAnimation = true;
    if (/animation:/.test(text) && !/animation:\s*none/.test(text)) hasCSSAnimation = true;
  });

  return hasAnimationElements || hasCSSAnimation;
}

export default function SvgAnimationIntegrator(): null {
  const { ready } = useTextures();

  useEffect(() => {
    if (!ready) return;

    let mounted = true;
    const replacedKeys = new Set<string>();
    const trackedTextures: PIXI.Texture[] = [];
    const drawFns: (() => void)[] = [];
    let rafId: number | null = null;
    let lastTime = 0;

    // Single shared loop for all active animated textures, throttled to ~30 FPS
    const sharedLoop = (time: number) => {
      if (!mounted) return;
      rafId = window.requestAnimationFrame(sharedLoop);

      const delta = time - lastTime;
      if (delta > 33) {
        lastTime = time;
        drawFns.forEach((fn) => fn());
      }
    };
    rafId = window.requestAnimationFrame(sharedLoop);

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

            let isDirty = false;

            img.onload = () => {
              if (!mounted) return;
              isDirty = true;
              const w = img.naturalWidth || TILE_W;
              const h = img.naturalHeight || TILE_H;
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;

              // Create texture once
              let baseTex: PIXI.BaseTexture | null = null;
              let tex: PIXI.Texture | null = null;
              try {
                baseTex = new PIXI.BaseTexture(canvas);
                tex = new PIXI.Texture(baseTex);
                trackedTextures.push(tex);
                try { delete (PIXI.utils as any).TextureCache[key]; } catch (e) { /* ignore */ }
                PIXI.Texture.addToCache(tex, key);
              } catch (e) {
                // Ignore initial texture swap errors
              }

              // Register draw function to shared loop
              drawFns.push(() => {
                if (!mounted) return;
                try {
                  // Mark dirty implicitly each frame to capture SVG internal ticking.
                  isDirty = true;

                  if (isDirty) {
                    ctx.clearRect(0, 0, w, h);
                    ctx.drawImage(img, 0, 0, w, h);
                    if (baseTex) baseTex.update();
                    isDirty = false;
                  }
                } catch (err) {
                  // ignore draw errors
                }
              });
            };

            img.onerror = (err) => {
              console.warn(`SvgAnimationIntegrator: Failed to load SVG image source. URL: ${url}`, err);
            };
          })
          .catch((err) => {
            console.warn(`SvgAnimationIntegrator: Failed to fetch SVG text. URL: ${url}`, err);
          });
      });
    } catch (err) {
      // ignore unexpected errors
      // eslint-disable-next-line no-console
      console.error('SvgAnimationIntegrator unexpected error', err);
    }

    return () => {
      mounted = false;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      trackedTextures.forEach(tex => {
        try { tex.destroy(true); } catch (e) { /* ignore */ }
      });
    };
  }, [ready]);

  return null;
}
