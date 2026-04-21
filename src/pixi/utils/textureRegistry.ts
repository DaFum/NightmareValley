import * as PIXI from "pixi.js";
import { loadSpritesheets } from "./spritesheetLoader";
import { useState, useEffect } from "react";

class TextureRegistryService {
  private isReady = false;
  private initPromise: Promise<void> | null = null;

  async initTextures(): Promise<void> {
    if (this.isReady) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = loadSpritesheets().then(() => {
      this.isReady = true;
    });

    return this.initPromise;
  }

  getTexture(key: string): PIXI.Texture | undefined {
    return (PIXI.utils as any).TextureCache[key] || (PIXI as any).TextureCache[key];
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
    if (!ready) {
      TextureRegistry.initTextures().then(() => setReady(true));
    }
  }, [ready]);

  return { ready, registry: TextureRegistry };
}
