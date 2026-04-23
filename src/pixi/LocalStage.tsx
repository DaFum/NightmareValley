import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Application } from '@pixi/app';
import type { IApplicationOptions as ApplicationOptions } from '@pixi/app';
import { createRoot, AppProvider } from '@pixi/react';

interface LocalStageProps {
  width?: number;
  height?: number;
  options?: Partial<ApplicationOptions> & Record<string, any>;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// LocalStage: a minimal replacement for @pixi/react's Stage component
// Creates a PIXI.Application, mounts its canvas inside a div, and
// renders React elements into `app.stage` via `createRoot`.
// IMPORTANT: intentionally never touches `renderer.plugins.interaction`.
export function LocalStage({
  width = 800,
  height = 600,
  options = {},
  children,
  className,
  style,
}: LocalStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const rootRef = useRef<any>(null);

  // create application and root once
  useEffect(() => {
    const opts = { width, height, ...options } as ApplicationOptions;
    const app = new Application(opts as any);

    const container = containerRef.current;
    if (!container) {
      app.destroy();
      return;
    }

    // make canvas responsive inside the wrapper
    if ((app.view as any)?.style) {
      (app.view as any).style.width = '100%';
      (app.view as any).style.height = '100%';
    }
    container.appendChild(app.view as unknown as Node);

    // create a react root for the PIXI stage and render children
    // expose the app on the stage for any legacy helpers
    try {
      // attach a small marker used by some parts of @pixi/react
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      app.stage.__reactpixi = { root: app.stage };
    } catch (e) {
      // ignore
    }

    const pixiRoot = createRoot(app.stage);
    rootRef.current = pixiRoot;

    // Render the pixi-react tree into the PIXI stage and provide the app via context
    pixiRoot.render(<AppProvider value={app}>{children}</AppProvider>);

    // Ensure the PIXI stage triggers actual renderer updates when the reconciler requests it.
    const renderStage = () => {
      try {
        app.renderer.render(app.stage);
      } catch (e) {
        // ignore render errors
      }
    };

    // Listen for render requests emitted by the pixi reconciler and perform a render.
    app.stage.on("__REACT_PIXI_REQUEST_RENDER__", renderStage);

    // Do an initial render so the canvas shows the initial tree.
    renderStage();

    appRef.current = app;

    return () => {
      try {
        if (rootRef.current) {
          if (typeof rootRef.current.unmount === 'function') rootRef.current.unmount();
          else rootRef.current.render(null);
        }
      } catch (err) {
        // ignore
      }

      try {
        if (appRef.current) {
          // remove render listener before destroying
          try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            appRef.current.stage.off("__REACT_PIXI_REQUEST_RENDER__");
          } catch (e) {
            // ignore
          }

          appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        }
      } catch (err) {
        // ignore
      }

      if (container && app.view && container.contains(app.view as unknown as Node)) {
        container.removeChild(app.view as unknown as Node);
      }

      appRef.current = null;
      rootRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update children when they change
  useEffect(() => {
    if (rootRef.current && appRef.current) {
      try {
        rootRef.current.render(<AppProvider value={appRef.current}>{children}</AppProvider>);
      } catch (err) {
        // ignore
      }
    }
  }, [children]);

  // update size & options (resolution) when changed
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    if (typeof width === 'number' && typeof height === 'number') {
      app.renderer.resize(width, height);
    }
    if (options && typeof options === 'object' && 'resolution' in options && options.resolution != null) {
      app.renderer.resolution = (options as any).resolution;
      // NOTE: do NOT access `app.renderer.plugins.interaction` here to avoid deprecation warnings
    }
  }, [width, height, options]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', position: 'relative', ...style }} />;
}
