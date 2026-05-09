import { writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HOST = process.env.HOST ?? '127.0.0.1';
const PORT = parsePort(process.env.PORT, 5173);
const BASE_URL = `http://${HOST}:${PORT}`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

function parsePort(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0 && parsed <= 65535) return parsed;
  throw new Error(`Invalid PORT "${value}". Expected an integer from 1 to 65535.`);
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
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
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms: ${url}`);
}

async function waitForGameReady(page) {
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    return canvas != null && canvas.width > 0 && canvas.height > 0;
  }, { timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
}

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

async function assertVisible(locator) {
  await locator.first().waitFor({ state: 'visible', timeout: 10_000 });
}

async function assertNoBlankCanvas(page) {
  const hasPaintedCanvas = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!(canvas instanceof HTMLCanvasElement)) return false;
    const rect = canvas.getBoundingClientRect();
    return rect.width > 200 && rect.height > 200;
  });
  if (!hasPaintedCanvas) throw new Error('Game canvas did not mount with playable dimensions.');
}

async function setSpeed(page, speed) {
  await page.getByRole('button', { name: `${speed}x`, exact: true }).click();
  await page.waitForTimeout(350);
}

async function clickGamePoint(page, x, y) {
  await page.mouse.move(x, y);
  await page.waitForTimeout(150);
  await page.mouse.click(x, y);
  await page.waitForTimeout(300);
}

async function runSmoke() {
  await waitForServer(BASE_URL);
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--ignore-certificate-errors',
    ],
  });

  const consoleProblems = [];

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    context.setDefaultTimeout(10_000);
    context.setDefaultNavigationTimeout(20_000);
    await context.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('ui:guideOpen', '0');
      window.localStorage.setItem('ui:minimalHud', '0');
      window.localStorage.setItem('ui:autosaveEnabled', '0');
    });
    await context.route(/fonts\.googleapis\.com/, (route) => route.fulfill({
      status: 204,
      contentType: 'text/css',
      body: '',
    }));
    await context.route(/fonts\.gstatic\.com/, (route) => route.fulfill({
      status: 204,
      contentType: 'font/woff2',
      body: '',
    }));

    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleProblems.push(`[console] ${msg.text()}`);
      if (msg.type() === 'warning' && /Missing building texture|Failed to load spritesheet/i.test(msg.text())) {
        consoleProblems.push(`[console:${msg.type()}] ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      consoleProblems.push(`[pageerror] ${err.message}`);
    });

    await page.goto(`${BASE_URL}/game`, { waitUntil: 'domcontentloaded' });
    await waitForGameReady(page);
    await assertNoBlankCanvas(page);
    await assertVisible(page.getByLabel('Transport status'));
    await assertVisible(page.getByLabel('Economy overview'));

    await page.keyboard.press('b');
    await assertVisible(page.getByText('Architecture of Duty'));
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Build', exact: true }).click();
    await page.getByRole('button', { name: /Sepulcher Quarry/ }).click();
    await clickGamePoint(page, 520, 520);

    const roadTool = page.getByRole('button', { name: 'Toggle road building tool' });
    await roadTool.click();
    await clickGamePoint(page, 500, 480);
    await page.keyboard.press('Escape');
    const clearRoadTool = page.getByRole('button', { name: 'Toggle road removal tool' });
    await clearRoadTool.click();
    await clickGamePoint(page, 500, 480);
    await page.keyboard.press('Escape');
    await roadTool.click();
    await clickGamePoint(page, 500, 480);
    await page.keyboard.press('Escape');
    await page.keyboard.press('r');
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: /Inspect Vault of Digestive Stone/ }).first().click();
    await assertVisible(page.getByLabel('Building inspector'));
    await assertVisible(page.getByText('Hire Workers'));
    const staffAll = page.getByRole('button', { name: 'Staff all' });
    if (await staffAll.isEnabled().catch(() => false)) {
      await staffAll.click();
    }

    await setSpeed(page, 1);
    await setSpeed(page, 2);
    await setSpeed(page, 4);
    await page.waitForTimeout(1500);

    await cdpScreenshot(page, path.join(OUTPUT_DIR, 'game-smoke.png'));
    await context.close();
    if (consoleProblems.length > 0) {
      throw new Error(`Browser smoke found runtime errors:\n${consoleProblems.join('\n')}`);
    }
  } catch (error) {
    if (consoleProblems.length > 0) {
      const original = error instanceof Error ? error.message : String(error);
      throw new Error(`${original}\n\nBrowser console problems:\n${consoleProblems.join('\n')}`);
    }
    throw error;
  } finally {
    await browser.close();
  }

  console.log(`[smoke] playable loop passed at ${BASE_URL}/game`);
  console.log('[smoke] wrote screenshots/game-smoke.png');
}

runSmoke().catch((err) => {
  console.error('[smoke] failed:', err);
  process.exitCode = 1;
});
