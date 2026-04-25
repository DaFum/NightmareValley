import imageMap from "./vite-asset-loader";
import * as PIXI from "pixi.js";
import manifest from "../../assets/spritesheets/manifest.json";

type Rect = [number, number, number, number];

function rectFromBox(box: Rect) {
  const [x1, y1, x2, y2] = box;
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

function assetUrl(relPath: string) {
  return imageMap[relPath] || `/src/assets/spritesheets/${relPath}`;
}

export async function loadSpritesheets(): Promise<void> {
  const sheetFiles = new Set<string>();

  function walkAssigned(obj: any) {
    if (!obj) return;
    if (Array.isArray(obj)) {
      for (const v of obj) {
        if (v && typeof v === "object" && v.file) sheetFiles.add(v.file);
      }
      return;
    }
    for (const k of Object.keys(obj)) {
      // Skip metadata/notes blocks so JSON refs there aren't treated as
      // spritesheet image files (e.g. metadata.buildings_sheet.path).
      if (k === "metadata" || k === "notes") continue;
      const v = obj[k];
      if (v && typeof v === "object") {
        if (v.file) sheetFiles.add(v.file);
        else walkAssigned(v);
      }
    }
  }

  walkAssigned(manifest);

  const baseTextureMap = new Map<string, PIXI.BaseTexture>();

  // Helper to create a tiny fallback base texture (1x1 transparent)
  function createFallbackBaseTexture() {
    try {
      if (typeof document !== "undefined") {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, 1, 1);
        return PIXI.BaseTexture.from(canvas);
      } else {
        return PIXI.Texture.WHITE.baseTexture;
      }
    } catch (e) {
      return PIXI.Texture.WHITE.baseTexture;
    }
  }

  const loadPromises = Array.from(sheetFiles).map((file) => {
    const url = assetUrl(file);

    return new Promise<void>((resolve) => {
      // In browser environments, proactively load via Image so we control onerror/onload
      if (typeof document !== "undefined") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const bt = PIXI.BaseTexture.from(img, { scaleMode: PIXI.SCALE_MODES.NEAREST } as any);
            baseTextureMap.set(file, bt);
          } catch (e) {
            console.error("Failed to create BaseTexture from image:", url, e);
            baseTextureMap.set(file, createFallbackBaseTexture());
          }
          resolve();
        };
        img.onerror = (ev) => {
          console.error("Failed to load spritesheet image:", url, ev);
          baseTextureMap.set(file, createFallbackBaseTexture());
          resolve();
        };
        img.src = url;
      } else {
        // Non-browser (SSR / test) path: rely on PIXI.BaseTexture events
        const bt = PIXI.BaseTexture.from(url, { scaleMode: PIXI.SCALE_MODES.NEAREST });
        baseTextureMap.set(file, bt);

        if (bt.valid) {
          resolve();
        } else {
          function onLoaded() {
            bt.off("error", onError);
            baseTextureMap.set(file, bt);
            resolve();
          }
          function onError(ev: any) {
            bt.off("loaded", onLoaded);
            console.error("Failed to load spritesheet base texture:", url, ev);
            baseTextureMap.set(file, createFallbackBaseTexture());
            resolve();
          }
          bt.once("loaded", onLoaded);
          bt.once("error", onError);

          // If it became valid synchronously, short-circuit
          if (bt.valid) {
            bt.off("loaded", onLoaded);
            bt.off("error", onError);
            resolve();
          }
        }
      }
    });
  });

  try {
    await Promise.all(loadPromises);
  } catch (e) {
    // Guard against unexpected Promise rejections inside third-party libs.
    // We log and continue so the app can use fallback textures.
    // eslint-disable-next-line no-console
    console.error("Error while loading spritesheets:", e);
  }

  // Ensure a fallback exists for any file that didn't populate a base texture
  for (const file of sheetFiles) {
    if (!baseTextureMap.has(file)) {
      baseTextureMap.set(file, createFallbackBaseTexture());
    }
  }

  function keyFromFilePath(path: string) {
    return path.replace(/\//g, "_").replace(/\.[^.]+$/, "");
  }

  function registerTexture(key: string, tex: PIXI.Texture) {
    // Avoid re-adding textures with the same key to prevent PIXI warnings
    // about duplicate cache entries during HMR/reloads.
    try {
      if (PIXI.utils && PIXI.utils.TextureCache && PIXI.utils.TextureCache[key]) {
        // already registered, skip
        return;
      }
    } catch (e) {
      // If inspecting the cache fails for any reason, fall back to adding.
    }
    PIXI.Texture.addToCache(tex, key);
  }

  function handleEntry(file: string, box: Rect, explicitKey?: string) {
    const baseTex = baseTextureMap.get(file);
    if (!baseTex) {
      console.warn("No baseTexture for", file);
      return;
    }
    const r = rectFromBox(box);

    let frameX = r.x;
    let frameY = r.y;

    // If the provided box is zero-sized, treat it as "whole image"
    // and use the base texture's natural dimensions. This lets manifest
    // entries reference individual image files without needing their exact
    // pixel bounds at build-time.
    if ((r.width === 0 || r.height === 0) && baseTex.width && baseTex.height) {
      frameX = 0;
      frameY = 0;
      r.width = baseTex.width;
      r.height = baseTex.height;
    }

    // If the loaded base texture matches the target width/height exactly,
    // it means we loaded an individual extracted file rather than a spritesheet.
    if (baseTex.width === r.width && baseTex.height === r.height) {
      frameX = 0;
      frameY = 0;
    } else if (baseTex.width > 0 && baseTex.height > 0) {
      // Also fallback if frame goes out of bounds
      if (frameX + r.width > baseTex.width || frameY + r.height > baseTex.height) {
         frameX = 0;
         frameY = 0;
         r.width = baseTex.width;
         r.height = baseTex.height;
      }
    }

    const frame = new PIXI.Rectangle(frameX, frameY, r.width, r.height);
    const tex = new PIXI.Texture(baseTex, frame);

    const key = explicitKey || keyFromFilePath(file);
    registerTexture(key, tex);

    return key;
  }

  for (const topKey of Object.keys(manifest)) {
    const group = (manifest as any)[topKey];
    if (!group || topKey === "notes" || topKey === "metadata") continue;

    if (group.assigned && typeof group.assigned === "object") {
      // Flat (e.g. resources, workers)
      for (const logicalName of Object.keys(group.assigned)) {
        const entry = group.assigned[logicalName];
        let key = "";
        if (topKey === "resources") {
          key = `resource_${logicalName}`;
        } else if (topKey === "workers") {
          key = `worker_${logicalName}`;
        } else {
          key = `${topKey}_${logicalName}`;
        }

        // Special-case terrain entries: when manifest uses a zero-sized
        // box [0,0,0,0] for whole-image terrain sheets, extract a single
        // tile-sized frame (64x32) instead of registering the full image.
        // This prevents drawing the full large contact image for every
        // map tile and makes procedural maps render as tiled terrain.
        if (topKey === 'terrain' && Array.isArray(entry.box) && entry.box[2] === 0 && entry.box[3] === 0) {
          const tileW = 64;
          const tileH = 32;
          // box is [x1,y1,x2,y2] — produce a small box anchored at 0,0
          handleEntry(entry.file, [0, 0, tileW, tileH], key);
        } else {
          handleEntry(entry.file, entry.box, key);
        }
      }

      if (Array.isArray(group.extras)) {
        for (let i = 0; i < group.extras.length; i++) {
          const e = group.extras[i];
          const key = `${topKey}_extra_${String(i+1).padStart(2,"0")}`;
          handleEntry(e.file, e.box, key);
        }
      }
    } else {
      // Staged (e.g. buildings)
      for (const stageKey of Object.keys(group)) {
        const stage = group[stageKey];
        if (!stage) continue;

        if (stage.assigned) {
          for (const logicalName of Object.keys(stage.assigned)) {
            const entry = stage.assigned[logicalName];
            // Match the render adapter's exact expectation
            const fullKey = `${topKey}_${stageKey}_${logicalName}`;
            handleEntry(entry.file, entry.box, fullKey);
          }
        }
        if (Array.isArray(stage.extras)) {
          for (let i = 0; i < stage.extras.length; i++) {
            const e = stage.extras[i];
            const key = `${topKey}_${stageKey}_extra_${String(i+1).padStart(2,"0")}`;
            handleEntry(e.file, e.box, key);
          }
        }
      }
    }
  }

  // Debug: log registered texture keys to help diagnose missing sprites at runtime
  try {
    // eslint-disable-next-line no-console
    console.info("spritesheetLoader: registered textures:", Object.keys(PIXI.utils.TextureCache).slice(0, 200));
  } catch (e) {
    // ignore
  }

}
