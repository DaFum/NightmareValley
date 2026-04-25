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

/**
 * Capture the game canvas via canvas.toDataURL() (bypasses compositor).
 * Requires preserveDrawingBuffer: true on the Pixi Application.
 */
async function captureCanvasToFile(page, outputPath) {
  const dataURL = await page.evaluate(() => new Promise((resolve) => {
    // Wait one RAF so Pixi has rendered the current frame.
    requestAnimationFrame(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) { resolve(null); return; }
      resolve(canvas.toDataURL('image/png'));
    });
  }));
  if (!dataURL) throw new Error('Canvas not found for capture');
  const base64 = dataURL.replace(/^data:image\/png;base64,/, '');
  await writeFile(outputPath, Buffer.from(base64, 'base64'));
}

async function takeScreenshots() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let browser;
  try {
    await waitForServer(BASE_URL);

    browser = await chromium.launch({
      headless: true,
      args: [
        '--ignore-certificate-errors',
        '--disable-web-security',
        '--no-sandbox',
      ],
    });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    // Abort external font requests so they don't delay font readiness.
    await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

    await page.goto(`${BASE_URL}/game`, { waitUntil: 'load' });
    // Wait for PixiAppProvider to finish loading textures and mount the canvas.
    await page.waitForFunction(() => !!document.querySelector('canvas'), { timeout: 30_000 });
    // Allow several animation frames for Pixi to render the initial scene.
    await page.waitForTimeout(1500);
    await captureCanvasToFile(page, path.join(OUTPUT_DIR, 'game-overview.png'));

    const heatmapToggle = page.getByLabel('Show footfall heatmap');
    if (await heatmapToggle.count() === 0) {
      throw new Error(
        `heatmapToggle not found. Aborting page.screenshot for game-footfall-heatmap.png. ` +
        `Check DebugLogisticsPanel / NODE_ENV=development and ensure server is running at ${BASE_URL}. ` +
        `OUTPUT_DIR=${OUTPUT_DIR}`
      );
    }
    await heatmapToggle.check({ force: true });
    await page.waitForFunction(() => {
      const checkbox = document.querySelector('input[aria-label="Show footfall heatmap"]');
      return !!(checkbox && checkbox instanceof HTMLInputElement && checkbox.checked);
    });
    await page.waitForTimeout(500);
    await captureCanvasToFile(page, path.join(OUTPUT_DIR, 'game-footfall-heatmap.png'));

    await page.goto(`${BASE_URL}/debug`, { waitUntil: 'load' });
    await page.waitForFunction(() => document.body.textContent !== null && document.body.textContent.length > 0);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'debug-route.png'),
      fullPage: true,
      timeout: 60_000,
    });
  } finally {
    if (browser) await browser.close();
  }
}

takeScreenshots().catch((err) => {
  console.error('Failed to capture screenshots:', err);
  process.exitCode = 1;
});
