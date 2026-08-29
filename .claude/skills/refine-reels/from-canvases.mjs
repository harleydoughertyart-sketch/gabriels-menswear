#!/usr/bin/env node
/**
 * refine-reels — build a reel from ORDERED FULL-FRAME canvas exports (the fallback capture when an
 * app dump isn't available; export the whole canvas after each refinement, I diff consecutive
 * frames to locate each edit). Prefer the app dump (`from-dump.mjs`) — it has the REAL masks.
 *
 * Reveals = the full next state, crossfaded over the previous (only the edited region changes ⇒
 * always crisp). A diff only LOCATES the edit; the brush is a BIG soft ellipse over it (a diff
 * under-measures the real brushed area, so it's expanded generously). Output matches from-dump's
 * schema so the generic preview.html renders it: edits[{ reveal, brush?, full, zoom, cx, cy, areaPct }].
 *
 * Usage:
 *   node from-canvases.mjs --out <reelDir> --base <before.(png|jpg)> --states a.png,b.png,c.png
 *        [--height 1600] [--zoom 1.8] [--thresh 40] [--brush-blur 68]
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const sharp = createRequire(join(ROOT, 'server', 'package.json'))('sharp');

const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const outDir = resolve(arg('--out'));
const basePath = resolve(arg('--base'));
const states = arg('--states').split(',').map((s) => resolve(s.trim()));
const H = Number(arg('--height', '1600'));
const ZOOM = Number(arg('--zoom', '1.8'));
const THRESH = Number(arg('--thresh', '40'));
const BRUSH_BLUR = Math.max(1, Math.round(Number(arg('--brush-blur', String(Math.round(H / 24))))));
const FULL_FRAC = 0.45;
const EXPAND = 1.5; // brush ellipse vs the measured change bbox — the real brushed area is bigger

const publicUrl = (() => {
  const i = outDir.replace(/\\/g, '/').indexOf('/public/');
  if (i === -1) throw new Error('reel dir must live under a /public/ folder');
  return outDir.replace(/\\/g, '/').slice(i + '/public'.length);
})();

const rgb = (p, W) => sharp(p).resize(W, H, { fit: 'fill' }).removeAlpha().raw().toBuffer();

const meta = await sharp(states[0]).metadata();
const W = Math.round(H * (meta.width / meta.height));

await sharp(basePath).resize(W, H, { fit: 'fill' }).jpeg({ quality: 88 }).toFile(join(outDir, 'base.jpg'));

const frames = [await rgb(basePath, W), ...(await Promise.all(states.map((s) => rgb(s, W))))];
const N = W * H;
const edits = [];

for (let i = 1; i < frames.length; i++) {
  const prev = frames[i - 1], cur = frames[i];
  let count = 0, minX = W, minY = H, maxX = -1, maxY = -1;
  for (let p = 0; p < N; p++) {
    const o = p * 3;
    const d = Math.abs(cur[o] - prev[o]) + Math.abs(cur[o + 1] - prev[o + 1]) + Math.abs(cur[o + 2] - prev[o + 2]);
    if (d <= THRESH) continue;
    count++;
    const x = p % W, y = (p / W) | 0;
    if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
  }
  const frac = count / N;
  await sharp(states[i - 1]).resize(W, H, { fit: 'fill' }).jpeg({ quality: 90 }).toFile(join(outDir, `cutout-${i}.jpg`));
  const edit = { reveal: `${publicUrl}/cutout-${i}.jpg`, full: frac > FULL_FRAC };
  if (edit.full || maxX < 0) {
    Object.assign(edit, { full: true, cx: 0.5, cy: 0.5, areaPct: 100, zoom: 1 });
    console.log(`edit ${i}: FULL reveal (changed ${(frac * 100).toFixed(0)}%)`);
  } else {
    // BIG soft ellipse over the change — the brushed selection is much larger than the visible diff.
    const ecx = (minX + maxX) / 2, ecy = (minY + maxY) / 2;
    const rx = Math.max(8, ((maxX - minX) / 2) * EXPAND), ry = Math.max(8, ((maxY - minY) / 2) * EXPAND);
    const a = Buffer.alloc(N);
    const x0 = Math.max(0, Math.floor(ecx - rx)), x1 = Math.min(W - 1, Math.ceil(ecx + rx));
    const y0 = Math.max(0, Math.floor(ecy - ry)), y1 = Math.min(H - 1, Math.ceil(ecy + ry));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const nx = (x - ecx) / rx, ny = (y - ecy) / ry, d = Math.sqrt(nx * nx + ny * ny);
      if (d > 1) continue;
      const t = d <= 0.55 ? 1 : (1 - d) / 0.45; // dense core, soft radial fade to the edge (brush-dab look)
      a[y * W + x] = Math.round(255 * Math.max(0, Math.min(1, t)));
    }
    // NB: sharp may return the blurred grayscale as 3 channels — read info.channels, don't assume 1.
    const { data: ad, info: ai } = await sharp(Buffer.from(a), { raw: { width: W, height: H, channels: 1 } }).blur(BRUSH_BLUR).raw().toBuffer({ resolveWithObject: true });
    const ach = ai.channels;
    const rgba = Buffer.alloc(N * 4);
    for (let p = 0; p < N; p++) { rgba[p * 4] = 255; rgba[p * 4 + 1] = 255; rgba[p * 4 + 2] = 255; rgba[p * 4 + 3] = ad[p * ach]; }
    await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toFile(join(outDir, `brush-${i}.png`));
    const cx = +(((minX + maxX + 1) / 2) / W).toFixed(3), cy = +(((minY + maxY + 1) / 2) / H).toFixed(3);
    const broad = (maxX - minX) / W > 0.55 || frac > 0.14; // wide/big edit ⇒ stay full-frame (no punch-in)
    Object.assign(edit, { brush: `${publicUrl}/brush-${i}.png`, zoom: broad ? 1 : ZOOM, cx, cy, areaPct: +(frac * 100).toFixed(1) });
    console.log(`edit ${i}: local  cx=${cx} cy=${cy} area=${(frac * 100).toFixed(1)}%  zoom=${broad ? 1 : ZOOM}  brushBlur=${BRUSH_BLUR}`);
  }
  edits.push(edit);
}

writeFileSync(join(outDir, 'reel.json'), JSON.stringify({ base: `${publicUrl}/base.jpg`, edits }, null, 2) + '\n');
console.log(`\nwrote ${join(outDir, 'reel.json')} (${W}x${H})`);
