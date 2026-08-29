#!/usr/bin/env node
/**
 * refine-reels assembler — turn a folder of transparent inpaint-layer exports into a RefineCase
 * (the data the site's animation engine plays: marketing/src/refine/refineCase.ts).
 *
 * A reel folder holds:
 *   base.(jpg|png)   the "before" — the flattened original the buyer would start with
 *   cutout-1.png     layer 1 exported with the app's Export panel "Transparent BG" (PNG) on
 *   cutout-2.png     layer 2, ...   (each = ONE area's finished state, feathered, over transparency)
 *
 * We read each cut-out's opaque region to derive where it sits (cx, cy) and how big the change is
 * (areaPct) — the exact numbers a RefineCase edit needs — so nothing is measured by hand.
 *
 * Usage:
 *   node assemble.mjs <reelDir> [--zoom 1.8] [--base-url /assets/launch/reels/<name>]
 *   node assemble.mjs --selfcheck        # runs against the shipped ring cut-outs; asserts + exits
 *
 * ponytail: derivation is a single alpha-bbox scan, not a diff pipeline — the transparent layer
 * IS the cut-out, so there is nothing to reverse-engineer. Zoom defaults to the ring-case 1.8.
 */
import { createRequire } from 'node:module';
import { readdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..'); // <root>/.claude/skills/refine-reels/ -> <root>
// sharp is a server dependency; resolve it from there rather than duplicating the install.
const require = createRequire(join(ROOT, 'server', 'package.json'));
const sharp = require('sharp');

const ALPHA_MIN = 8; // ignore faint feather tails when finding the changed region
const DEFAULT_ZOOM = 1.8;

/** Opaque-region bounding box + pixel count of a transparent PNG, as fractions of the frame. */
async function measureCutout(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels } = info;
  let minX = W, minY = H, maxX = -1, maxY = -1, count = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * channels + (channels - 1)] < ALPHA_MIN) continue;
      count++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX) throw new Error(`${basename(file)} is fully transparent — is this a real layer export?`);
  return {
    W, H,
    cx: +(((minX + maxX + 1) / 2) / W).toFixed(3),
    cy: +(((minY + maxY + 1) / 2) / H).toFixed(3),
    areaPct: +((count / (W * H)) * 100).toFixed(1),
  };
}

/** Numeric sort so cutout-2 < cutout-10 (the reveal order the buyer painted them in). */
function sortedCutouts(dir) {
  return readdirSync(dir)
    .filter((f) => /^cutout-\d+\.png$/i.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10));
}

function publicUrlFor(reelDir, fallbackBaseUrl) {
  const norm = reelDir.replace(/\\/g, '/');
  const i = norm.indexOf('/public/');
  if (i !== -1) return norm.slice(i + '/public'.length); // .../marketing/public/assets/x -> /assets/x
  if (fallbackBaseUrl) return fallbackBaseUrl.replace(/\/$/, '');
  throw new Error('Reel dir is outside a /public/ folder — pass --base-url /assets/launch/reels/<name>');
}

async function buildCase(reelDir, { zoom, baseUrl }) {
  const baseName = ['base.jpg', 'base.jpeg', 'base.png'].find((f) => existsSync(join(reelDir, f)));
  if (!baseName) throw new Error(`No base.jpg/base.png in ${reelDir}`);
  const cutouts = sortedCutouts(reelDir);
  if (!cutouts.length) throw new Error(`No cutout-N.png files in ${reelDir} (export each layer with Transparent BG)`);

  const urlBase = publicUrlFor(reelDir, baseUrl);
  const baseMeta = await sharp(join(reelDir, baseName)).metadata();
  const edits = [];
  for (const name of cutouts) {
    const m = await measureCutout(join(reelDir, name));
    if (m.W !== baseMeta.width || m.H !== baseMeta.height) {
      throw new Error(`${name} is ${m.W}x${m.H} but base is ${baseMeta.width}x${baseMeta.height} — layers must match the base frame (don't resize the doc mid-session).`);
    }
    edits.push({ reveal: `${urlBase}/${name}`, cx: m.cx, cy: m.cy, areaPct: m.areaPct });
  }
  return { base: `${urlBase}/${baseName}`, zoom, edits };
}

async function selfCheck() {
  // The shipped ring reel: base + two feathered layer cut-outs, with centres hand-verified in
  // refineCase.ts (snake 0.356,0.618 · blue 0.637,0.558). Deriving from alpha must land near them.
  const dir = join(ROOT, 'marketing', 'public', 'assets', 'launch', 'refinement');
  const cases = [
    { file: 'snake-cutout.png', cx: 0.356, cy: 0.618 },
    { file: 'blue-cutout.png', cx: 0.637, cy: 0.558 },
  ];
  let ok = true;
  for (const c of cases) {
    const m = await measureCutout(join(dir, c.file));
    const dx = Math.abs(m.cx - c.cx), dy = Math.abs(m.cy - c.cy);
    const near = dx <= 0.1 && dy <= 0.1;
    const sane = m.areaPct > 0 && m.areaPct < 100 && m.cx > 0 && m.cx < 1 && m.cy > 0 && m.cy < 1;
    if (!near || !sane) ok = false;
    console.log(`${near && sane ? 'OK ' : 'BAD'} ${c.file}  derived cx=${m.cx} cy=${m.cy} area=${m.areaPct}%  (expected ~${c.cx},${c.cy})`);
  }
  if (!ok) {
    console.error('SELFCHECK FAILED');
    process.exit(1);
  }
  console.log('SELFCHECK PASSED');
}

const args = process.argv.slice(2);
if (args[0] === '--selfcheck') {
  await selfCheck();
} else {
  const reelDir = args[0];
  if (!reelDir) {
    console.error('usage: node assemble.mjs <reelDir> [--zoom 1.8] [--base-url /assets/...]   |   --selfcheck');
    process.exit(2);
  }
  const zoom = args.includes('--zoom') ? Number(args[args.indexOf('--zoom') + 1]) : DEFAULT_ZOOM;
  const baseUrl = args.includes('--base-url') ? args[args.indexOf('--base-url') + 1] : undefined;
  const refineCase = await buildCase(resolve(reelDir), { zoom, baseUrl });
  const out = join(resolve(reelDir), 'reel.json');
  writeFileSync(out, JSON.stringify(refineCase, null, 2) + '\n');
  console.log(JSON.stringify(refineCase, null, 2));
  console.log(`\nwrote ${out}`);
}
