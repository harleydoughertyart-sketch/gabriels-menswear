#!/usr/bin/env node
/**
 * ingest.mjs — turn a folder of app exports into a finished, wired reel in ONE command.
 *
 *   node .claude/skills/refine-reels/ingest.mjs --name jewelry-on-model --dry
 *   node .claude/skills/refine-reels/ingest.mjs --name jewelry-on-model --wire
 *
 * This exists because the manual path cost an hour: hunting the founder's Downloads folder,
 * guessing which export was the starting image, which was the ad, what order they went in, and
 * what he had typed. Every one of those is recoverable from the files themselves — mtime gives
 * the order, the app's own export filenames carry the prompt, and the ad is the odd one out.
 *
 * It reads, in order:
 *   1. the newest images in --from (default: the founder's Downloads), oldest first = beat order
 *   2. each filename, for the prompt the app stamped into it
 *   3. consecutive pairs, diffed, to locate each edit and derive its selection mask
 * then writes base/state-N/mask-N/metadata.json/ad.json, runs from-dump.mjs, and (with --wire)
 * registers the reel in ReelsPage.tsx and the marketing vite allowlist.
 *
 * ALWAYS run --dry first and show the founder the plan table. Classification is heuristic; it is
 * far cheaper for him to correct one --ad/--base flag than to watch a wrong reel.
 *
 * What this CANNOT recover: the real brush masks. Canvas exports do not carry them, so masks here
 * are derived from the diff. The in-app dump (Ctrl+Alt+R) carries the true mask and the prompt as
 * typed — prefer it when the reel needs to show an exact selection.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { createRequire } from 'node:module';

// This is a tool run dozens of times a session; a bad flag should read as one line, not as a
// forty-line Node stack. Top-level await turns a throw into an unhandled rejection, so both.
const die = (err) => {
  console.error(`\n✗ ${err?.message ?? err}\n`);
  process.exit(1);
};
process.on('uncaughtException', die);
process.on('unhandledRejection', die);

const REPO = process.cwd();
const require_ = createRequire(join(REPO, 'server/package.json'));
const sharp = require_('sharp');

const arg = (flag, fallback = null) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
};
const has = (flag) => process.argv.includes(flag);

const name = arg('--name');
if (!name) throw new Error('need --name <reel-name>');
if (!/^[a-z0-9][a-z0-9-]*$/i.test(name)) {
  throw new Error(`--name "${name}": use letters, digits and hyphens only — it becomes a folder and a URL`);
}
const fromDirDefault = () => join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');
const fromDir = arg('--from', fromDirDefault());
const sinceHours = Number(arg('--since', '12'));
const dry = has('--dry');
const outDir = join(REPO, 'marketing/public/assets/launch/reels', name);

const IMAGE = /\.(png|jpe?g|webp)$/i;

// ---------------------------------------------------------------------------------------------
// --add-ad: bolt an ad beat onto an EXISTING reel, whatever built it.
//
// Reels made before the dump layout (candle and friends) have no base.png/state-N.png for
// from-dump.mjs to re-read, so a full rebuild is not available to them. An ad beat needs none of
// that — it is one more reveal on the end — so this edits reel.json in place and every older reel
// can still end on its ad.
// ---------------------------------------------------------------------------------------------
const addAd = arg('--add-ad');
if (addAd) {
  const reelName = arg('--name');
  if (!reelName) throw new Error('--add-ad needs --name <existing reel>');
  const dir = join(REPO, 'marketing/public/assets/launch/reels', reelName);
  const reelPath = join(dir, 'reel.json');
  if (!existsSync(reelPath)) throw new Error(`no reel.json in ${dir} — is --name right?`);
  const adSrc = existsSync(addAd) ? addAd : join(fromDirDefault(), addAd);
  if (!existsSync(adSrc)) throw new Error(`--add-ad ${addAd} not found`);

  const reel = JSON.parse(readFileSync(reelPath, 'utf8'));
  const baseFile = join(dir, basename(reel.base));
  if (!existsSync(baseFile)) throw new Error(`cannot size the ad: ${baseFile} missing`);
  const { width: W, height: H } = await sharp(baseFile).metadata();

  const ext = extname(adSrc);
  copyFileSync(adSrc, join(dir, `ad${ext}`));
  await sharp(adSrc).resize(W, H, { fit: 'fill' }).jpeg({ quality: 92 }).toFile(join(dir, 'ad-reveal.jpg'));

  const publicUrl = `/assets/launch/reels/${reelName}`;
  const adEdit = { reveal: `${publicUrl}/ad-reveal.jpg`, transition: 'ad', full: true, zoom: 1, cx: 0.5, cy: 0.5 };
  const adTag = { text: 'Turn into ad', kind: 'stage', tone: 'ad' };
  const replacing = reel.edits.at(-1)?.transition === 'ad';
  if (replacing) {
    reel.edits[reel.edits.length - 1] = adEdit;
    if (reel.tags) reel.tags[reel.tags.length - 1] = adTag;
  } else {
    reel.edits.push(adEdit);
    if (reel.tags) reel.tags.push(adTag);
  }
  writeFileSync(reelPath, `${JSON.stringify(reel, null, 2)}\n`);
  console.log(`${replacing ? 'replaced' : 'added'} the ad beat on ${reelName} (${W}x${H}) <- ${basename(adSrc)}`);
  if (!reel.tags) {
    console.log('⚠ this reel.json has no tags — its chips come from ReelsPage.tsx; add the ad chip there.');
  }
  console.log(`\nwatch it: http://localhost:5174/reels?only=${reelName}\n`);
  process.exit(0);
}
const MAX_LOCAL_FRAC = 0.16; // above this an edit is treated as a full-frame regeneration

// ---------------------------------------------------------------------------------------------
// 1. Collect + order.
//
// NOT by file mtime — that is when the file was last *downloaded*, and re-downloading one export
// silently reorders the reel. The self-test caught exactly that: it put the ad before the
// generation it was made from. Every app export carries its real creation time INSIDE the name —
// an epoch stamp ("canvas-1785516972656", "1785517725459-x7wmv6-openai-…") or a wall-clock stamp
// ("…-2026-07-31-12-56-finished"). Read that; fall back to mtime only when neither is present.
// ---------------------------------------------------------------------------------------------
/** 2020-01-01 .. 2100-01-01 — a 13-digit run that is not a plausible date is not a timestamp. */
const EPOCH_MIN = 1577836800000;
const EPOCH_MAX = 4102444800000;
const stampOf = (fileName, mtime) => {
  const epoch = fileName.match(/(?:^|[-_])(\d{13})(?:[-_.]|$)/);
  if (epoch && Number(epoch[1]) >= EPOCH_MIN && Number(epoch[1]) <= EPOCH_MAX) {
    return { at: Number(epoch[1]), from: 'epoch in name' };
  }
  const wall = fileName.match(/(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/);
  if (wall) {
    const [, y, mo, d, hh, mm] = wall;
    // Wall stamps are minute-resolution while epoch stamps are millisecond. Landing this at the
    // START of the minute let a "-finished" export sort ahead of the canvas it was finished FROM,
    // when both fell in the same minute. Anchor it to the END of its minute instead: these are
    // derived exports, so if the ordering is a coin toss, later is the right answer.
    return { at: new Date(+y, +mo - 1, +d, +hh, +mm, 59, 999).getTime(), from: 'stamp in name' };
  }
  return { at: mtime, from: 'file mtime' };
};
const cutoff = Date.now() - sinceHours * 3600_000;
const explicitOrder = arg('--order');
let files;
if (explicitOrder) {
  files = explicitOrder.split(',').map((f) => {
    const p = f.trim().includes('/') || f.trim().includes('\\') ? f.trim() : join(fromDir, f.trim());
    if (!existsSync(p)) throw new Error(`--order: ${p} not found`);
    return { path: p, name: basename(p), mtime: statSync(p).mtimeMs };
  });
} else {
  if (!existsSync(fromDir)) throw new Error(`--from ${fromDir} not found`);
  files = readdirSync(fromDir)
    .filter((f) => IMAGE.test(f))
    .map((f) => {
      const mtime = statSync(join(fromDir, f)).mtimeMs;
      const stamp = stampOf(f, mtime);
      return { path: join(fromDir, f), name: f, mtime, at: stamp.at, stampFrom: stamp.from };
    })
    .filter((f) => f.mtime >= cutoff || f.at >= cutoff)
    // Stable: two exports can share a minute-resolution stamp, and an unstable order there would
    // silently swap two beats between runs.
    .sort((a, b) => a.at - b.at || a.mtime - b.mtime || a.name.localeCompare(b.name));
}
for (const f of files) if (f.at == null) Object.assign(f, stampOf(f.name, f.mtime));

// A Downloads folder collects work from more than one reel. Anything named here is dropped before
// classification — cheaper than discovering a foreign product halfway through the finished reel.
const skip = (arg('--skip') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
if (skip.length) {
  const before = files.length;
  files = files.filter((f) => !skip.some((s) => f.name === s || f.name.includes(s)));
  console.log(`--skip dropped ${before - files.length} file(s)`);
}
if (!files.length) throw new Error(`no images in ${fromDir} from the last ${sinceHours}h — pass --since or --order`);

// ---------------------------------------------------------------------------------------------
// 2. Read each filename for the prompt the app stamped into it. The app exports as
//    "<prompt as typed>-YYYY-MM-DD-HH-MM-finished.png"; canvas dumps and provider outputs
//    ("1785517725459-x7wmv6-openai-<hash>.png") carry no prompt at all.
// ---------------------------------------------------------------------------------------------
const PROVIDER = /^\d{10,}-[a-z0-9]{5,}-(openai|gemini|atlas|klein)[-.]/i;
const CANVAS = /^canvas[-_]\d+/i;
const CAPTION_MAX = 58;
const HEDGE = /^(?:ok(?:ay)?|so|um|please|can you|could you|i(?:'d| would)? (?:want|like|need)(?: (?:it|this|him|her|them))? to (?:have|be|get)|i want (?:it|this|him|her|them) to (?:have|be|get)|i want|lets|let's|make it so|maybe)\s+/i;
const TRAILING_VAGUE = /[,;]?\s*(?:or something(?: that (?:go|goes) with)?|or whatever|maybe something like that|and stuff|etc\.?)\s*$/i;

const condense = (raw) => {
  let t = String(raw ?? '').replace(/\s+/g, ' ').trim();
  for (let p = 0; p < 3 && HEDGE.test(t); p += 1) t = t.replace(HEDGE, '');
  t = t.replace(TRAILING_VAGUE, '').replace(/\s*,\s*$/, '').trim();
  // Stripping a hedge can strand its article: "i want her to have a something…" -> "a something…"
  t = t.replace(/^(?:a|an|the)\s+(?=something\b|some\b)/i, '').trim();
  if (t.length > CAPTION_MAX && t.includes(',')) t = t.slice(0, t.indexOf(',')).trim();
  if (t.length > CAPTION_MAX) {
    const cut = t.lastIndexOf(' ', CAPTION_MAX);
    t = `${t.slice(0, cut > 20 ? cut : CAPTION_MAX).trim()}…`;
  }
  return t ? t.charAt(0).toLowerCase() + t.slice(1) : '';
};

const promptFromName = (file) => {
  const stem = basename(file, extname(file));
  if (PROVIDER.test(stem) || CANVAS.test(stem)) return '';
  const cleaned = stem
    .replace(/[-_]+\d{4}-\d{2}-\d{2}(?:-\d{2})*(?:-finished|-final)?$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || /^untitled$/i.test(cleaned)) return '';
  return condense(cleaned);
};

for (const f of files) {
  const m = await sharp(f.path).metadata();
  f.w = m.width;
  f.h = m.height;
  f.aspect = +(m.width / m.height).toFixed(3);
  f.prompt = promptFromName(f.name);
}

// ---------------------------------------------------------------------------------------------
// 3. Classify. The ad is the odd one out: it is the last export, and it is the one whose pixels
//    contain large flat areas of laid-out type. Both signals are checked so the guess can be
//    reported with a reason the founder can sanity-check at a glance.
// ---------------------------------------------------------------------------------------------
/** Fraction of the frame that is near-uniform colour — an ad's copy column reads very high. */
const flatFraction = async (path) => {
  const w = 160;
  const h = Math.max(1, Math.round((w * 5) / 4));
  const { data } = await sharp(path).resize(w, h, { fit: 'fill' }).greyscale().blur(1).raw().toBuffer({ resolveWithObject: true });
  let flat = 0;
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = y * w + x;
      const grad = Math.abs(data[i] - data[i + 1]) + Math.abs(data[i] - data[i + w]);
      if (grad < 2) flat += 1;
    }
  }
  return flat / ((w - 2) * (h - 2));
};

for (const f of files) f.flat = +(await flatFraction(f.path)).toFixed(3);

const adOverride = arg('--ad');
const baseOverride = arg('--base');
let adFile = null;
if (adOverride !== 'none') {
  adFile = adOverride
    ? files.find((f) => f.name === adOverride || f.path === adOverride)
    : (() => {
        const last = files[files.length - 1];
        const others = files.slice(0, -1);
        const typical = others.length ? others.reduce((s, f) => s + f.flat, 0) / others.length : 0;
        // Last export, and flatter than the photography that preceded it = laid-out artwork.
        return last && (last.flat > typical + 0.06 || last.aspect !== others[0]?.aspect) ? last : null;
      })();
  if (adOverride && !adFile) throw new Error(`--ad ${adOverride} not among the collected files`);
}

const stateFiles = files.filter((f) => f !== adFile);
let baseEntry = null;
if (baseOverride) {
  const p = baseOverride.includes('/') || baseOverride.includes('\\') ? baseOverride : join(fromDir, baseOverride);
  const resolved = existsSync(p) ? p : join(REPO, baseOverride);
  if (!existsSync(resolved)) throw new Error(`--base ${baseOverride} not found`);
  baseEntry = { path: resolved, name: basename(resolved), prompt: '' };
} else {
  baseEntry = stateFiles.shift() ?? null;
}
if (!baseEntry) throw new Error('no starting image — pass --base');
if (!stateFiles.length && !adFile) throw new Error('nothing to animate: need at least one state or an ad');

// ---------------------------------------------------------------------------------------------
// 4. Diff each consecutive pair to locate the edit and derive its mask.
// ---------------------------------------------------------------------------------------------
/** sharp returns 3 channels from a raw 1-channel pipeline unless the colourspace is pinned. */
const grey1 = async (buf, width, height, ops = (p) => p) => {
  const out = await ops(sharp(buf, { raw: { width, height, channels: 1 } })).toColourspace('b-w').raw().toBuffer({ resolveWithObject: true });
  if (out.info.channels !== 1) throw new Error(`expected 1 channel, got ${out.info.channels}`);
  return out;
};

const analyse = async (prevPath, nextPath, aspect) => {
  // Sample at the reel's REAL aspect. Forcing 4:5 here distorted the geometry for any other
  // shape, which threw off both the bbox and the mask derived from it.
  const w = 800;
  const h = Math.max(1, Math.round(w / (aspect || 0.8)));
  const a = await sharp(prevPath).resize(w, h, { fit: 'fill' }).greyscale().raw().toBuffer();
  const b = await sharp(nextPath).resize(w, h, { fit: 'fill' }).greyscale().raw().toBuffer();
  // Threshold high: exports arrive at different resolutions and resampling noise alone trips a
  // low one everywhere, which is what once threw a derived mask to the bottom of the frame.
  const hit = Buffer.alloc(w * h);
  let n = 0, minX = w, minY = h, maxX = -1, maxY = -1;
  for (let i = 0; i < hit.length; i += 1) {
    if (Math.abs(a[i] - b[i]) > 26) {
      hit[i] = 255;
      n += 1;
      const x = i % w, y = Math.floor(i / w);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const frac = n / (w * h);
  const spread = n ? ((maxX - minX) / w) * ((maxY - minY) / h) : 0;
  // A finishing pass is a GLOBAL, LOW-AMPLITUDE grade: almost every pixel shifts a little, and
  // almost none shift a lot. The local-edit threshold above cannot see it — the first attempt at
  // this reel measured a real finalize as "0.0% changed" and dropped the beat entirely.
  let nudged = 0;
  for (let i = 0; i < a.length; i += 1) if (Math.abs(a[i] - b[i]) > 2) nudged += 1;
  const graded = nudged / (w * h);
  return {
    hit, w, h, frac, spread, n, graded,
    bbox: { x0: minX / w, x1: maxX / w, y0: minY / h, y1: maxY / h },
  };
};

/** Grow the changed pixels out to the area a brush would plausibly have covered, and soften. */
const maskFromDiff = async (diff, W, H) => {
  let g = (await grey1(diff.hit, diff.w, diff.h, (p) => p.blur(26))).data;
  for (let i = 0; i < g.length; i += 1) g[i] = g[i] > 4 ? 255 : 0;
  const soft = (await grey1(g, diff.w, diff.h, (p) => p.resize(W, H, { fit: 'fill' }).blur(26))).data;
  const px = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i += 1) {
    px[i * 4] = 255; px[i * 4 + 1] = 255; px[i * 4 + 2] = 255; px[i * 4 + 3] = soft[i];
  }
  return sharp(px, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
};

if (!stateFiles.length) {
  throw new Error('no state images — a reel needs at least one edit beat between the base and the ad');
}
const reelAspect = stateFiles[0].aspect;
const odd = stateFiles.filter((f) => Math.abs(f.aspect - reelAspect) > 0.02);
if (odd.length) {
  console.log(`\n⚠ aspect mismatch — these will be squashed to ${reelAspect}: ${odd.map((f) => `${f.name} (${f.aspect})`).join(', ')}`);
}

const plan = [];
let prev = baseEntry;
for (const [idx, f] of stateFiles.entries()) {
  const d = await analyse(prev.path, f.path, reelAspect);
  // The app names a finishing pass "<prompt>-…-finished"; confirm it with the grade signature so
  // a merely re-saved export is not mistaken for one.
  const namedFinished = /-finished\.[a-z]+$/i.test(f.name);
  const kind =
    namedFinished && d.frac < 0.02 && d.graded > 0.2
      ? 'finalize'
      : d.frac > MAX_LOCAL_FRAC || d.spread > 0.45
        ? 'generation'
        : 'refine';
  plan.push({ index: idx + 1, file: f, diff: d, kind, caption: kind === 'finalize' ? 'Finalize' : f.prompt });
  prev = f;
}

// ---------------------------------------------------------------------------------------------
// 5. Report. Always printed — this table is what the founder confirms before anything is built.
// ---------------------------------------------------------------------------------------------
const pad = (s, n) => String(s).padEnd(n);
console.log(`\nreel: ${name}    from: ${fromDir}    ${explicitOrder ? '(explicit order)' : `last ${sinceHours}h, oldest first`}\n`);
console.log(pad('beat', 6) + pad('kind', 14) + pad('changed', 12) + pad('caption', 36) + 'file');
console.log('-'.repeat(116));
console.log(pad('base', 6) + pad('starting image', 14) + pad('', 12) + pad('', 36) + baseEntry.name);
// A true starting image is the unglamorous BEFORE and looks nothing like beat 1. If it is nearly
// identical, the real starting image was probably never exported.
if (plan[0] && plan[0].diff.frac < 0.25) {
  console.log(
    `\n⚠ base and beat 1 differ by only ${(plan[0].diff.frac * 100).toFixed(1)}% — "${baseEntry.name}" looks like a\n` +
      '  state, not a starting image. If the real before-shot was not exported, pass --base <path>.',
  );
}
for (const p of plan) {
  console.log(
    pad(p.index, 6) +
      pad(p.kind === 'generation' ? 'swipe' : p.kind === 'finalize' ? 'finalize ✦' : 'brush', 14) +
      pad(p.kind === 'finalize' ? `${(p.diff.graded * 100).toFixed(0)}% graded` : `${(p.diff.frac * 100).toFixed(1)}%`, 12) +
      pad(p.caption || '⚠ no prompt', 36) +
      p.file.name,
  );
}
if (adFile) console.log(pad('ad', 6) + pad('ad beat', 14) + pad('', 12) + pad(`flat ${adFile.flat}`, 36) + adFile.name);
console.log(`\nordered by: ${[...new Set(files.map((f) => f.stampFrom ?? 'file mtime'))].join(', ')}`);
// A whole-frame regeneration is normal as beat 1 and suspicious after it — the usual cause is a
// file from a DIFFERENT reel sitting in the same Downloads folder.
const strangers = plan.filter((p) => p.index > 1 && p.diff.frac > 0.6);
if (strangers.length) {
  console.log(`\n⚠ beat(s) ${strangers.map((p) => p.index).join(', ')} replace the whole frame mid-reel:`);
  for (const p of strangers) console.log(`    ${p.file.name}`);
  console.log('  If that is from another reel, re-run with --skip <part-of-the-filename>.');
}
const missing = plan.filter((p) => !p.caption);
if (missing.length) {
  console.log(`\n⚠ ${missing.length} beat(s) have no prompt in the filename — set "caption" in metadata.json,`);
  console.log('  or ask the founder what he typed. Do not invent one.');
}
if (plan.some((p) => p.kind === 'refine')) {
  console.log('\nnote: masks below are DERIVED from the diff, not the real brush. Ctrl+Alt+R in the app dumps the true mask.');
}
if (dry) {
  console.log('\n--dry: nothing written. Re-run without --dry to build.\n');
  process.exit(0);
}

// ---------------------------------------------------------------------------------------------
// 6. Write the dump layout and build.
// ---------------------------------------------------------------------------------------------
mkdirSync(outDir, { recursive: true });
// Clear the previous build FIRST. from-dump.mjs walks state-1, state-2, … until one is missing,
// so a rebuild with fewer beats would otherwise inherit the old tail — a stale state-4 from an
// earlier attempt silently reappears as a beat nobody asked for.
const STALE = /^(?:state|mask|brush|cutout|reveal|ad-reveal|reference)-\d+\.(png|jpe?g|avif)$|^(?:base|ad)\.(png|jpe?g)$|^(?:base|ad-reveal)-\d+\.avif$/i;
let cleared = 0;
for (const f of readdirSync(outDir)) {
  if (STALE.test(f)) { rmSync(join(outDir, f)); cleared += 1; }
}
if (cleared) console.log(`cleared ${cleared} file(s) from the previous build`);

await sharp(baseEntry.path).png().toFile(join(outDir, 'base.png'));
const first = plan[0]?.file ?? adFile;
const fm = await sharp(first.path).metadata();
const W = fm.width, H = fm.height;

const states = [];
for (const p of plan) {
  await sharp(p.file.path).png().toFile(join(outDir, `state-${p.index}.png`));
  if (p.kind === 'refine' && p.diff.n > 0) {
    writeFileSync(join(outDir, `mask-${p.index}.png`), await maskFromDiff(p.diff, W, H));
  }
  states.push({
    index: p.index,
    layerName: p.caption || `edit ${p.index}`,
    ...(p.caption ? { caption: p.caption } : {}),
    provenance: {
      op: p.kind,
      prompt: p.kind === 'finalize' ? 'finalize' : p.caption || '',
    },
    source: p.file.name,
  });
}
if (adFile) {
  copyFileSync(adFile.path, join(outDir, `ad${extname(adFile.path)}`));
  writeFileSync(
    join(outDir, 'ad.json'),
    `${JSON.stringify({ image: `ad${extname(adFile.path)}`, label: 'Turn into ad' }, null, 2)}\n`,
  );
} else if (existsSync(join(outDir, 'ad.json'))) {
  // A leftover ad.json points at an image this rebuild just deleted, and from-dump would fail on it.
  rmSync(join(outDir, 'ad.json'));
  console.log('removed a stale ad.json (this build has no ad)');
}
writeFileSync(
  join(outDir, 'metadata.json'),
  `${JSON.stringify(
    {
      version: 2,
      source: 'ingest.mjs',
      note: `Built from ${fromDir} exports, ordered by export time. Masks are derived from consecutive-state diffs, not the app's real brush — re-dump with Ctrl+Alt+R for exact selections.`,
      width: W,
      height: H,
      states,
    },
    null,
    2,
  )}\n`,
);

const brushBlur = arg('--brush-blur');
execFileSync(
  'node',
  [
    join(REPO, '.claude/skills/refine-reels/from-dump.mjs'),
    '--out', outDir,
    ...(brushBlur ? ['--brush-blur', brushBlur] : []),
  ],
  { stdio: 'inherit' },
);

// ---------------------------------------------------------------------------------------------
// 7. Wire it up so it is watchable immediately.
// ---------------------------------------------------------------------------------------------
if (has('--wire')) {
  const reelsPage = join(REPO, 'marketing/src/pages/ReelsPage.tsx');
  let src = readFileSync(reelsPage, 'utf8');
  if (!src.includes(`name: '${name}'`)) {
    src = src.replace(/(const REELS[^\n]*\[\n)/, `$1  { name: '${name}' },\n`);
    writeFileSync(reelsPage, src);
    console.log(`wired  ReelsPage.tsx  -> { name: '${name}' }`);
  }
  const viteConfig = join(REPO, 'marketing/vite.config.ts');
  let vite = readFileSync(viteConfig, 'utf8');
  const root = `assets/launch/reels/${name}`;
  if (!vite.includes(root)) {
    vite = vite.replace(/(const NON_PRODUCTION_ASSET_ROOTS = \[\n)/, `$1  '${root}',\n`);
    writeFileSync(viteConfig, vite);
    console.log(`wired  vite.config.ts -> ${root}`);
  }
}

console.log(`\nwatch it: http://localhost:5174/reels?only=${name}\n`);
