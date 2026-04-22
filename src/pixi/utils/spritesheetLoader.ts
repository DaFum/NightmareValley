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
        if (v.file) sheetFiles.add(v.file);
      }
      return;
    }
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (v && typeof v === "object") {
        if (v.file) sheetFiles.add(v.file);
        else walkAssigned(v);
      }
    }
  }

  walkAssigned(manifest);

  const baseTextureMap = new Map<string, PIXI.BaseTexture>();

  await Promise.all(
    Array.from(sheetFiles).map((file) => {
      const url = assetUrl(file);
      const baseTex = PIXI.BaseTexture.from(url, { scaleMode: PIXI.SCALE_MODES.NEAREST });

      const loadPromise = new Promise<void>((resolve, reject) => {
        if (baseTex.valid) {
          resolve();
        } else {
          function onLoaded() {
            baseTex.off("error", onError);
            resolve();
          }
          function onError(err: any) {
            baseTex.off("loaded", onLoaded);
            reject(err);
          }

          baseTex.once("loaded", onLoaded);
          baseTex.once("error", onError);

          // Check again in case it loaded synchronously between the check and adding listeners
          if (baseTex.valid) {
            baseTex.off("loaded", onLoaded);
            baseTex.off("error", onError);
            resolve();
          }
        }
      });

      baseTextureMap.set(file, baseTex);
      return loadPromise;
    })
  );

  function keyFromFilePath(path: string) {
    return path.replace(/\//g, "_").replace(/\.[^.]+$/, "");
  }

  function registerTexture(key: string, tex: PIXI.Texture) {
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
    if (!group || topKey === "notes") continue;

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
        handleEntry(entry.file, entry.box, key);
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

}
