/**
 * Records the scroll of index.html to a video file.
 *
 * Drives the page with a real eased scroll instead of jumping the scrollbar, so
 * the scrub clips, the pinned acts and the drifting background all render the
 * way a visitor sees them.
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node scripts/capture-scroll.cjs
 *
 * Env:
 *   URL       page to record         (default http://127.0.0.1:4173/index.html)
 *   OUT       output directory       (default .github/media)
 *   TO        scroll target in px    (default 5100 - hero, voice, week)
 *   SECONDS   time spent scrolling   (default 14)
 *   W, H      viewport               (default 1280x800)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL_ = process.env.URL || 'http://127.0.0.1:4173/index.html';
const OUT = path.resolve(process.env.OUT || '.github/media');
const TO = Number(process.env.TO || 5100);
const SECONDS = Number(process.env.SECONDS || 14);
const W = Number(process.env.W || 1280);
const H = Number(process.env.H || 800);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium' });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  const page = await context.newPage();
  await page.goto(URL_, { waitUntil: 'load' });

  // The scrub clips are fetched as blobs, so wait for real decoded frames
  // rather than for the load event.
  await page.waitForFunction(() => {
    const vids = [...document.querySelectorAll('video[data-sc-scrub]')];
    return vids.length > 0 && vids.slice(0, 2).every((v) => v.readyState >= 3);
  }, null, { timeout: 45000 }).catch(() => console.warn('scrub clips still buffering'));
  await page.evaluate(() => document.fonts.ready);

  // The stylesheet sets scroll-behavior: smooth for anchor links. A wheel
  // ignores that; a scripted scrollTo does not, and every frame would animate
  // against the last one. Turn it off so the capture tracks a real wheel.
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
  await page.waitForTimeout(2500);

  await page.evaluate(({ to, seconds }) => new Promise((done) => {
    // Ramped-linear travel: a short accelerate, a long steady middle, a short
    // decelerate. A plain ease-in-out doubles the speed through the middle,
    // which is exactly where the pinned copy needs time to be read.
    const r = 0.15;
    const ease = (x) => {
      let p;
      if (x < r) p = (x * x) / (2 * r);
      else if (x <= 1 - r) p = r / 2 + (x - r);
      else { const u = x - (1 - r); p = r / 2 + (1 - 2 * r) + u - (u * u) / (2 * r); }
      return p / (1 - r);
    };
    const hold = 700;
    const start = performance.now();
    (function step(now) {
      const t = now - start - hold;
      if (t <= 0) return requestAnimationFrame(step);
      const p = Math.min(t / (seconds * 1000), 1);
      window.scrollTo(0, Math.round(ease(p) * to));
      if (p < 1) return requestAnimationFrame(step);
      setTimeout(done, 1200);
    })(performance.now());
  }), { to: TO, seconds: SECONDS });

  await context.close();
  await browser.close();

  const webm = fs.readdirSync(OUT).filter((f) => f.endsWith('.webm')).map((f) => path.join(OUT, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  const named = path.join(OUT, 'scroll.webm');
  if (webm && webm !== named) { fs.rmSync(named, { force: true }); fs.renameSync(webm, named); }
  console.log(named, (fs.statSync(named).size / 1e6).toFixed(1) + ' MB');
})();
