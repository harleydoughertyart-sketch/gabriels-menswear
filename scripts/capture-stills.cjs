/**
 * Screenshots the page at the scroll positions that matter, for the README.
 *
 * Scrolls the way capture-scroll.cjs does, then waits for the scrub clock to
 * settle before each shot, so a still shows the frame a reader would actually
 * be looking at rather than one the lerp had not reached yet.
 *
 *   node scripts/capture-stills.cjs
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL_ = process.env.URL || 'http://127.0.0.1:4173/index.html';
const OUT = path.resolve(process.env.OUT || '.github/media');

const SHOTS = [
  { name: '01-hero', y: 0, note: 'the hero at rest' },
  { name: '02-hero-scrubbed', y: 1250, note: 'the same clip, scrubbed' },
  { name: '03-week', y: 3050, note: 'the pinned week' },
  { name: '04-turn', y: 5450, note: 'the turn' },
  { name: '05-wedding', y: 6300, note: 'the wedding act opening' },
  { name: '06-wedding-mid', y: 8200, note: 'mid wedding act' },
  { name: '07-rail', y: 10400, note: 'the rail panning sideways' },
  { name: '08-stitch', y: 12500, note: 'the stitch pin' },
  { name: '09-reviews', y: 14200, note: 'reviews' },
  { name: '10-visit', y: 16800, note: 'the visit block' },
];

async function settleTo(page, y) {
  await page.evaluate((target) => new Promise((done) => {
    const from = window.scrollY;
    const dist = target - from;
    const ms = Math.min(1400, 200 + Math.abs(dist) * 0.35);
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min((now - t0) / ms, 1);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      window.scrollTo(0, Math.round(from + dist * e));
      if (p < 1) return requestAnimationFrame(step);
      done();
    })(performance.now());
  }), y);
  // The scrub clock eases currentTime toward its target, so give it frames.
  await page.waitForTimeout(1600);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium' });

  for (const device of [
    { tag: '', viewport: { width: 1440, height: 900 } },
    { tag: '-mobile', viewport: { width: 390, height: 844 }, only: ['01-hero', '03-week', '07-rail'] },
  ]) {
    const context = await browser.newContext({
      viewport: device.viewport,
      deviceScaleFactor: 2,
      isMobile: device.tag === '-mobile',
      hasTouch: device.tag === '-mobile',
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    await page.goto(URL_, { waitUntil: 'load' });
    await page.waitForFunction(() => {
      const v = [...document.querySelectorAll('video[data-sc-scrub]')];
      return v.length > 0 && v.slice(0, 2).every((x) => x.readyState >= 3);
    }, null, { timeout: 45000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
    await page.waitForTimeout(2500);

    const docH = await page.evaluate(() => document.documentElement.scrollHeight);
    const scale = docH / 18132; // shots were placed against the 1280x800 layout

    for (const shot of SHOTS) {
      if (device.only && !device.only.includes(shot.name)) continue;
      await settleTo(page, Math.round(shot.y * scale));
      const file = path.join(OUT, `${shot.name}${device.tag}.png`);
      await page.screenshot({ path: file });
      console.log(file, shot.note);
    }
    await context.close();
  }
  await browser.close();
})();
