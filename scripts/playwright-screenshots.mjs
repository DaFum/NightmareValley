import { writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const INCLUDE_DEV_SCREENSHOTS = process.env.INCLUDE_DEV_SCREENSHOTS === '1';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await new Promise((resolve) => {
        const req = http.get(url, (res) => {
          res.resume();
          resolve(res.statusCode != null && res.statusCode >= 200 && res.statusCode < 500);
        });
        req.setTimeout(1500, () => {
          req.destroy();
          resolve(false);
        });
        req.on('error', () => resolve(false));
      });
      if (ok) return;
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
  writeFileSync(outputPath, Buffer.from(data, 'base64'));
  client.detach().catch(() => undefined);
}

async function closeBrowser(browser) {
  if (!browser) return;
  await Promise.race([
    browser.close(),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
}

async function closeContext(context) {
  if (!context) return;
  await Promise.race([
    context.close(),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]);
}

async function launchChromium() {
  const { chromium } = await Promise.race([
    import('playwright'),
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('Playwright import timed out after 15000ms')),
      15_000
    )),
  ]);

  return Promise.race([
    chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--ignore-certificate-errors',
      ],
    }),
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('Chromium launch timed out after 15000ms')),
      15_000
    )),
  ]);
}

async function takeScreenshots() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let browser;
  try {
    await waitForServer(BASE_URL);

    console.log('[screenshots] launching chromium');
    browser = await launchChromium();
    const desktopContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    desktopContext.setDefaultTimeout(10_000);
    desktopContext.setDefaultNavigationTimeout(15_000);
    const page = await desktopContext.newPage();

    // Log page errors to aid debugging
    page.on('pageerror', (err) => console.error('[page error]', err.message));

    // Abort external font requests so they don't delay font readiness.
    await desktopContext.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

    console.log('[screenshots] opening desktop game view');
    await page.goto(`${BASE_URL}/game`, { waitUntil: 'domcontentloaded' });
    await waitForGameReady(page);

    // Full composite screenshot — captures canvas + all React UI overlays
    await cdpScreenshot(page, path.join(OUTPUT_DIR, 'game-overview.png'));
    console.log('[screenshots] wrote game-overview.png');

    console.log('[screenshots] opening mobile game view');
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    mobileContext.setDefaultTimeout(10_000);
    mobileContext.setDefaultNavigationTimeout(15_000);
    await mobileContext.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    const mobilePage = await mobileContext.newPage();
    mobilePage.on('pageerror', (err) => console.error('[mobile page error]', err.message));
    await mobilePage.goto(`${BASE_URL}/game`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    await waitForGameReady(mobilePage);
    await cdpScreenshot(mobilePage, path.join(OUTPUT_DIR, 'game-mobile.png'));
    console.log('[screenshots] wrote game-mobile.png');
    await closeContext(mobileContext);

    // Heatmap screenshot — only available when server runs with __DEV__ = true
    if (INCLUDE_DEV_SCREENSHOTS) {
      const devContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      devContext.setDefaultTimeout(10_000);
      devContext.setDefaultNavigationTimeout(15_000);
      await devContext.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
      const devPage = await devContext.newPage();
      await devPage.goto(`${BASE_URL}/game`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      await waitForGameReady(devPage);
      const heatmapToggle = devPage.getByLabel('Show footfall heatmap');
      if (await heatmapToggle.count() > 0) {
        await heatmapToggle.check({ force: true });
        await devPage.waitForFunction(() => {
          const checkbox = document.querySelector('input[aria-label="Show footfall heatmap"]');
          return !!(checkbox && checkbox instanceof HTMLInputElement && checkbox.checked);
        }, { timeout: 10_000 });
        await devPage.waitForTimeout(500);
        await cdpScreenshot(devPage, path.join(OUTPUT_DIR, 'game-footfall-heatmap.png'));
      } else {
        console.warn('[skip] heatmapToggle not found — requires __DEV__=true.');
      }

      await devPage.goto(`${BASE_URL}/debug`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
      const isDebugPage = await devPage.evaluate(() =>
        !document.querySelector('.not-found-route') &&
        document.body.textContent != null &&
        document.body.textContent.length > 20
      );
      if (isDebugPage) {
        await cdpScreenshot(devPage, path.join(OUTPUT_DIR, 'debug-route.png'));
      } else {
        console.warn('[skip] /debug route not available — requires __DEV__=true.');
      }
      await closeContext(devContext);
    }
  } finally {
    await closeBrowser(browser);
  }
}

takeScreenshots().catch((err) => {
  console.error('Failed to capture screenshots:', err);
  process.exitCode = 1;
}).finally(() => {
  process.exit(process.exitCode ?? 0);
});
