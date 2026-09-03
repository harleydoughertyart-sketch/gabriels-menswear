/**
 * Records one slow pass down the whole page on a desktop viewport and on a
 * phone, timed so the two runs stay in step, then reports the trim offsets so
 * ffmpeg can stand them side by side.
 *
 * Each device travels its own full scroll range over the same number of
 * seconds, so the pair reads as one journey even though the two layouts are
 * different heights.
 *
 *   node scripts/capture-journey.cjs
 *
 * Env:
 *   URL       page to record       (default http://127.0.0.1:4173/index.html)
 *   OUT       output directory     (default .github/media)
 *   SECONDS   length of the pass   (default 44)
 *
 * Then stand the two recordings side by side. Trim each by its own duration
 * minus the motion length this script prints, since the two pages finish
 * buffering at different moments:
 *
 *   ffmpeg -ss <d> -i journey-desktop.webm -ss <m> -i journey-mobile.webm \
 *     -filter_complex "color=c=0xECE8E1:s=2100x1040:r=25[bg];\
 *       [0:v]scale=1536:960,setsar=1,drawbox=x=0:y=0:w=iw:h=ih:color=black@0.18:t=2[d];\
 *       [1:v]scale=-2:960,setsar=1,drawbox=x=0:y=0:w=iw:h=ih:color=black@0.18:t=2[m];\
 *       [bg][d]overlay=40:40:shortest=1[b1];[b1][m]overlay=1616:40:shortest=1[out]" \
 *     -map "[out]" -t 46.4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p \
 *     -vf scale=1680:-2 -movflags +faststart -an journey.mp4
 *
 * The GIF is the same file sped up, since a 46-second GIF is unreadable and
 * enormous:
 *
 *   ffmpeg -i journey.mp4 -vf "setpts=PTS/2.9,fps=8,scale=600:-1:flags=lanczos,\
 *     split[a][b];[a]palettegen=stats_mode=diff:max_colors=128[p];\
 *     [b][p]paletteuse=dither=none:diff_mode=rectangle" -loop 0 journey.gif
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL_ = process.env.URL || 'http://127.0.0.1:4173/index.html';
const OUT = path.resolve(process.env.OUT || '.github/media');
const SECONDS = Number(process.env.SECONDS || 44);
const HOLD = 900;
const TAIL = 1400;

const DEVICES = [
  { tag: 'desktop', viewport: { width: 1280, height: 800 }, mobile: false },
  { tag: 'mobile', viewport: { width: 390, height: 844 }, mobile: true },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium' });
  const report = [];

  for (const device of DEVICES) {
    const context = await browser.newContext({
      viewport: device.viewport,
      deviceScaleFactor: 1,
      isMobile: device.mobile,
      hasTouch: device.mobile,
      reducedMotion: 'no-preference',
      recordVideo: { dir: OUT, size: device.viewport },
    });
    const page = await context.newPage();
    await page.goto(URL_, { waitUntil: 'load' });

    await page.waitForFunction(() => {
      const v = [...document.querySelectorAll('video[data-sc-scrub]')];
      return v.length > 0 && v.slice(0, 2).every((x) => x.readyState >= 3);
    }, null, { timeout: 45000 }).catch(() => console.warn(device.tag + ': clips still buffering'));
    await page.evaluate(() => document.fonts.ready);
    // A wheel ignores scroll-behavior: smooth. A scripted scrollTo does not,
    // and every frame would animate against the last one.
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
    await page.waitForTimeout(2500);

    await page.evaluate(({ seconds, hold, tail }) => new Promise((done) => {
      const to = document.documentElement.scrollHeight - window.innerHeight;
      const r = 0.1;
      const ease = (x) => {
        let p;
        if (x < r) p = (x * x) / (2 * r);
        else if (x <= 1 - r) p = r / 2 + (x - r);
        else { const u = x - (1 - r); p = r / 2 + (1 - 2 * r) + u - (u * u) / (2 * r); }
        return p / (1 - r);
      };
      const start = performance.now();
      (function step(now) {
        const t = now - start - hold;
        if (t <= 0) return requestAnimationFrame(step);
        const p = Math.min(t / (seconds * 1000), 1);
        window.scrollTo(0, Math.round(ease(p) * to));
        if (p < 1) return requestAnimationFrame(step);
        setTimeout(done, tail);
      })(performance.now());
    }), { seconds: SECONDS, hold: HOLD, tail: TAIL });

    await context.close();

    const webm = fs.readdirSync(OUT).filter((f) => f.endsWith('.webm') && !f.startsWith('journey-'))
      .map((f) => path.join(OUT, f))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    const named = path.join(OUT, `journey-${device.tag}.webm`);
    fs.rmSync(named, { force: true });
    fs.renameSync(webm, named);
    report.push({ file: named, tag: device.tag });
    console.log(named);
  }

  await browser.close();
  // The recording starts at page load, so the motion begins this far in.
  console.log('motion length (s):', (HOLD + SECONDS * 1000 + TAIL) / 1000);
  console.log('trim each file from: duration minus that length');
})();
