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
  throw new Error(`Dev server did not become ready within ${timeoutMs}ms: ${url}`);
}

async function takeScreenshots() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let browser;
  try {
    await waitForServer(BASE_URL);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!document.querySelector('canvas'));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'game-overview.png'),
      fullPage: true,
    });

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
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'game-footfall-heatmap.png'),
      fullPage: true,
    });

    await page.goto(`${BASE_URL}/debug`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.textContent !== null && document.body.textContent.length > 0);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'debug-route.png'),
      fullPage: true,
    });
  } finally {
    if (browser) await browser.close();
  }
}

takeScreenshots().catch((err) => {
  console.error('Failed to capture screenshots:', err);
  process.exitCode = 1;
});
