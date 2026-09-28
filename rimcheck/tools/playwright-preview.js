/* Headed Playwright walkthrough of the four RimCheck screens, slowed down so it can be watched.
   Usage: node tools/playwright-preview.js            (browser stays open at the end until you close it)
          PLAYWRIGHT_PATH=<dir of playwright module> node tools/playwright-preview.js */
const path = require('path');
const os = require('os');
const fs = require('fs');

function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_PATH, 'playwright'].filter(Boolean);
  // fall back to the copy npx caches (npx playwright ...)
  const npx = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), '.npm'), 'npm-cache', '_npx');
  if (fs.existsSync(npx)) fs.readdirSync(npx).forEach(d => tries.push(path.join(npx, d, 'node_modules', 'playwright')));
  for (const t of tries) { try { return require(t); } catch (_) { } }
  throw new Error('Playwright not found. Run: npm i -D playwright  (or set PLAYWRIGHT_PATH)');
}

const { chromium } = loadPlaywright();
const ROOT = path.resolve(__dirname, '..');
const URL = 'file:///' + ROOT.replace(/\\/g, '/') + '/index.html';

async function step(label, fn) { console.log('> ' + label); await fn(); }

async function onScreen(page, n) {
  await page.waitForFunction(id => window.RC && RC.router && RC.router.current() === id &&
    !document.getElementById('transition-veil').classList.contains('on'), n, { timeout: 30000 });
  await page.waitForTimeout(400);
}

/* Real pointer drag: press on the sensor, glide to a spot near the mark, release. */
async function dragSensorTo(page, key, offset = [0, 0]) {
  const from = await page.locator('.fourth-sensor').boundingBox();
  const to = await page.locator(`.fourth-zone[data-key="${key}"]`).boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2 + offset[0], to.y + to.height / 2 + offset[1], { steps: 40 });
  await page.waitForTimeout(500); // hold over the mark so the highlight is visible
  await page.mouse.up();
  await page.waitForFunction(k => RC.state.sensorPlacement === k, key);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 60, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));

  await step('Title screen', async () => {
    await page.goto(URL);
    await onScreen(page, 1);
    await page.waitForTimeout(1200);
    await page.click('.title-reference-start');
  });

  await step('Screen 2 - prediction: Yes', async () => {
    await onScreen(page, 2);
    await page.waitForTimeout(1500);
    await page.click('.reference-answer.yes');
  });

  await step('Screen 3 - shot rattles out, players run in, question appears', async () => {
    await onScreen(page, 3);
    await page.locator('.third-question').waitFor({ state: 'visible', timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.click('.third-answer[data-call="none"]');
  });

  await step('Screen 4 - drag sensor to "Far support" and test', async () => {
    await onScreen(page, 4);
    await page.waitForTimeout(1200);
    await dragSensorTo(page, 'farPole', [30, -20]);
    await page.waitForTimeout(700);
    await page.click('#cta');
    await page.locator('.fourth-result').waitFor({ state: 'visible' });
    await page.waitForTimeout(1800);
  });

  await step('Screen 4 - try another spot: "Beside net"', async () => {
    await page.click('#cta'); // Try Another Spot
    await page.waitForTimeout(600);
    await dragSensorTo(page, 'hoopSide', [-35, 25]);
    await page.waitForTimeout(700);
    await page.click('#cta');
    await page.waitForFunction(() => RC.state.sensorPlacementTests.hoopSide === true);
  });

  console.log('Walkthrough complete: ' + (await page.textContent('.fourth-result')));
  console.log('Browser left open - close the window to finish.');
  await page.waitForEvent('close', { timeout: 0 }).catch(() => { });
  await browser.close().catch(() => { });
})().catch(e => { console.error(e); process.exit(1); });
