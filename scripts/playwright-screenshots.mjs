import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return;
    } catch {
      // Server not ready yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Dev server did not become ready within ${timeoutMs}ms: ${url}`);
}

async function waitForGameReady(page) {
  // Wait for Pixi canvas to mount and have non-zero dimensions
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    return canvas != null && canvas.width > 0 && canvas.height > 0;
  }, { timeout: 30_000 });
  // Allow several frames for the full scene (terrain, buildings, UI) to render
  await page.waitForTimeout(3000);
}

/**
 * Capture a full composite screenshot (canvas + UI overlays) via CDP.
 * page.screenshot() hangs when a game's RAF loop keeps the main thread busy;
 * sending Page.captureScreenshot directly over CDP bypasses that wait.
 */
async function cdpScreenshot(page, outputPath) {
  const client = await page.context().newCDPSession(page);
  const { data } = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(outputPath, Buffer.from(data, 'base64'));
  await client.detach();
}

async function takeScreenshots() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let browser;
  try {
    await waitForServer(BASE_URL);

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--ignore-certificate-errors',
      ],
    });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    // Log page errors to aid debugging
    page.on('pageerror', (err) => console.error('[page error]', err.message));

    // Abort external font requests so they don't delay font readiness.
    await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

    await page.goto(`${BASE_URL}/game`, { waitUntil: 'load' });
    await waitForGameReady(page);

    // Full composite screenshot — captures canvas + all React UI overlays
    await cdpScreenshot(page, path.join(OUTPUT_DIR, 'game-overview.png'));

    // Heatmap screenshot — only available when server runs with __DEV__ = true
    const heatmapToggle = page.getByLabel('Show footfall heatmap');
    if (await heatmapToggle.count() > 0) {
      await heatmapToggle.check({ force: true });
      await page.waitForFunction(() => {
        const checkbox = document.querySelector('input[aria-label="Show footfall heatmap"]');
        return !!(checkbox && checkbox instanceof HTMLInputElement && checkbox.checked);
      });
      await page.waitForTimeout(500);
      await cdpScreenshot(page, path.join(OUTPUT_DIR, 'game-footfall-heatmap.png'));
    } else {
      console.warn(
        `[skip] heatmapToggle not found — DebugLogisticsPanel requires __DEV__=true. ` +
        `Run against the dev server (port 5173) to capture game-footfall-heatmap.png.`
      );
    }

    // Debug route — only available when server runs with __DEV__ = true
    await page.goto(`${BASE_URL}/debug`, { waitUntil: 'load' });
    const isDebugPage = await page.evaluate(() =>
      !document.querySelector('.not-found-route') &&
      document.body.textContent != null &&
      document.body.textContent.length > 20
    );
    if (isDebugPage) {
      await cdpScreenshot(page, path.join(OUTPUT_DIR, 'debug-route.png'));
    } else {
      console.warn(
        `[skip] /debug route not available — requires __DEV__=true. ` +
        `Run against the dev server (port 5173) to capture debug-route.png.`
      );
    }
  } finally {
    if (browser) await browser.close();
  }
}

takeScreenshots().catch((err) => {
  console.error('Failed to capture screenshots:', err);
  process.exitCode = 1;
});
