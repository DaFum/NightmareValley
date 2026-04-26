import { mkdir } from 'node:fs/promises';
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
  throw new Error(`Server did not become ready within ${timeoutMs}ms: ${url}`);
}

async function waitForGameReady(page) {
  // Wait for Pixi canvas to mount
  await page.waitForFunction(() => !!document.querySelector('canvas'), { timeout: 30_000 });
  // Wait for WebGL context to be active
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!ctx;
  }, { timeout: 10_000 });
  // Allow several frames for the full scene (terrain, buildings, UI) to render
  await page.waitForTimeout(2000);
}

async function takeScreenshots() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let browser;
  try {
    await waitForServer(BASE_URL);
    console.log(`✓ Server ready at ${BASE_URL}`);

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

    // Abort external font requests
    await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

    console.log('Loading game page...');
    await page.goto(`${BASE_URL}/game`, { waitUntil: 'load' });
    await waitForGameReady(page);
    console.log('✓ Game ready');

    // Full composite screenshot — captures canvas + all React UI overlays
    console.log('Capturing map overview...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'map-overview.png'),
      fullPage: false,
    });
    console.log(`✓ Saved: map-overview.png`);

    // Zoom in and capture a second view
    console.log('Zooming in and capturing...');
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -200, bubbles: true }));
      }
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'map-zoomed.png'),
      fullPage: false,
    });
    console.log(`✓ Saved: map-zoomed.png`);

    console.log(`\n✅ Screenshots saved to: ${OUTPUT_DIR}`);
  } finally {
    if (browser) await browser.close();
  }
}

takeScreenshots().catch((err) => {
  console.error('Failed to capture screenshots:', err);
  process.exitCode = 1;
});
