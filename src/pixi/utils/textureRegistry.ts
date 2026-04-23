import * as PIXI from "pixi.js";
import { loadSpritesheets } from "./spritesheetLoader";
import { useState, useEffect } from "react";

class TextureRegistryService {
  private isReady = false;
  private initPromise: Promise<void> | null = null;

  async initTextures(): Promise<void> {
    if (this.isReady) return;
    if (this.initPromise) return this.initPromise;

    // Run the spritesheet loader but keep init resilient: do not allow
    // a rejected promise to bubble as an unhandled rejection. The
    // loader itself will insert fallback textures for failed loads.
    this.initPromise = (async () => {
      try {
        // Debug: announce start
        // eslint-disable-next-line no-console
        console.info("TextureRegistry: starting spritesheet load");
        await loadSpritesheets();
        this.isReady = true;
        // Debug: report texture cache after load
        try {
          // eslint-disable-next-line no-console
          console.info("TextureRegistry: load complete, texture keys:", Object.keys(PIXI.utils.TextureCache).slice(0, 200));
          // Debug: print a few texture details to ensure baseTextures are valid
          try {
            const keys = Object.keys(PIXI.utils.TextureCache).slice(0, 10);
            const details = keys.map((k) => {
              const t = PIXI.utils.TextureCache[k] as PIXI.Texture | undefined;
              return { key: k, width: t?.width ?? null, height: t?.height ?? null, baseValid: !!t?.baseTexture?.valid };
            });
            // eslint-disable-next-line no-console
            console.info('TextureRegistry: sample texture details', details);
          } catch (e) {
            // ignore
          }
        } catch (e) {
          // ignore
        }
            // Ensure basic terrain textures exist so map tiles render even
            // if terrain art isn't present in the spritesheet manifest.
            try {
              const terrainNames = [
                'scarredEarth',
                'weepingForest',
                'ribMountain',
                'placentaLake',
                'scarPath',
                'occupiedScar',
                'ashBog',
                'cathedralRock',
              ];
              const tileW = 64;
              const tileH = 32;
              const created: string[] = [];
              for (const name of terrainNames) {
                const key = `terrain_${name}`;
                if (!PIXI.utils.TextureCache[key]) {
                  try {
                    if (typeof document !== 'undefined') {
                      const canvas = document.createElement('canvas');
                      canvas.width = tileW;
                      canvas.height = tileH;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        let color = '#666';
                        switch (name) {
                          case 'scarredEarth': color = '#6B5132'; break;
                          case 'weepingForest': color = '#2F6F2F'; break;
                          case 'ribMountain': color = '#8A8A8A'; break;
                          case 'placentaLake': color = '#2F4FA0'; break;
                          case 'scarPath': color = '#8B5A2B'; break;
                          case 'occupiedScar': color = '#5A1B1B'; break;
                          case 'ashBog': color = '#4A4A4A'; break;
                          case 'cathedralRock': color = '#777777'; break;
                          default: color = '#666';
                        }
                        ctx.fillStyle = color;
                        ctx.fillRect(0, 0, tileW, tileH);
                      }
                      const tex = PIXI.Texture.from(canvas);
                      PIXI.Texture.addToCache(tex, key);
                    } else {
                      // Non-browser fallback
                      PIXI.Texture.addToCache(PIXI.Texture.WHITE, key);
                    }
                    created.push(key);
                  } catch (e) {
                    // ignore failures creating fallback
                  }
                }
              }
              if (created.length > 0) {
                // eslint-disable-next-line no-console
                console.info('TextureRegistry: created terrain fallbacks:', created);
              }
            } catch (e) {
              // ignore
            }
      } catch (err) {
        // Log and continue: the loader creates fallbacks so proceed
        // with the app instead of blocking startup.
        // eslint-disable-next-line no-console
        console.error('TextureRegistry.initTextures - loadSpritesheets failed:', err);
        this.isReady = true;
      }
    })();

    return this.initPromise;
  }

  getTexture(key: string): PIXI.Texture | undefined {
    return PIXI.utils.TextureCache[key] ?? undefined;
  }

  hasTexture(key: string): boolean {
    return !!this.getTexture(key);
  }

  getReady(): boolean {
    return this.isReady;
  }
}

export const TextureRegistry = new TextureRegistryService();

export function useTextures() {
  const [ready, setReady] = useState(TextureRegistry.getReady());

  useEffect(() => {
    let mounted = true;
    if (!ready) {
      TextureRegistry.initTextures()
        .then(() => {
          if (mounted) setReady(true);
        })
        .catch((err) => {
          if (mounted) setReady(false);
          console.error("Texture init failed", err);
        });
    }
    return () => {
      mounted = false;
    };
  }, [ready]);

  return { ready, registry: TextureRegistry };
}
