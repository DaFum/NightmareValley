import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const OUTPUT_DIR = path.resolve('screenshots');

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
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'game-overview.png'),
      fullPage: true,
    });

    const heatmapToggle = page.getByLabel('Show footfall heatmap');
    if (await heatmapToggle.count()) {
      await heatmapToggle.check({ force: true });
    }
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'game-footfall-heatmap.png'),
      fullPage: true,
    });

    await page.goto(`${BASE_URL}/debug`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
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
