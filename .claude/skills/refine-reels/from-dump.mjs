#!/usr/bin/env node
/**
 * refine-reels — build a reel from an APP DUMP (the automatic path; see window.__refineReels.dump).
 * The app writes base.png + state-1..N.png (cumulative flattened states) + mask-1..N.png (each
 * layer's REAL brushed selection). No diffing, no guessing — the mask IS the selection.
 *
 * Reveal   = the cumulative state (crossfade over the previous ⇒ only the edit shows).
 * Brush    = the real mask, averaged into a very soft display overlay for the reel. The raw
 *            mask-N.png remains untouched; only brush-N.png gets this heavier visual feather.
 * full     = a near-whole-frame mask (a full generation) ⇒ full-frame reveal, no zoom, no brush.
 * zoom     = punch in for a COMPACT edit; a broad edit (wide or big-area) stays full-frame so all
 *            appearing elements are visible (founder rule). Per-edit, override in reel.json anytime.
 * tags     = auto-authored from metadata.json provenance (recorded at stitch time in the app):
 *            gray "Starting image" stage chip, prompt pills verbatim, teal skill chips, pink
 *            "Finalize pass" chip (op finalize, or "finalize" in the prompt/layer name).
 *
 * Usage: node from-dump.mjs --out <reelDir> [--height 1600] [--zoom 1.8] [--brush-blur 68]
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const sharp = createRequire(join(ROOT, 'server', 'package.json'))('sharp');
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const outDir = resolve(arg('--out'));
const H = Number(arg('--height', '1600'));
const ZOOM = Number(arg('--zoom', '1.8'));
const BRUSH_BLUR = Math.max(1, Math.round(Number(arg('--brush-blur', String(Math.round(H / 24))))));

const publicUrl = (() => {
  const i = outDir.replace(/\\/g, '/').indexOf('/public/');
  if (i === -1) throw new Error('reel dir must live under a /public/ folder');
  return outDir.replace(/\\/g, '/').slice(i + '/public'.length);
})();

let nStates = 0;
while (existsSync(join(outDir, `state-${nStates + 1}.png`))) nStates++;
if (!existsSync(join(outDir, 'base.png')) || !nStates) throw new Error(`need base.png + state-N.png in ${outDir}`);

const dumpMetadata = existsSync(join(outDir, 'metadata.json'))
  ? JSON.parse(readFileSync(join(outDir, 'metadata.json'), 'utf8'))
  : null;
if (dumpMetadata?.warnings?.length) {
  console.warn(`metadata warnings:\n- ${dumpMetadata.warnings.join('\n- ')}`);
}

const meta = await sharp(join(outDir, 'state-1.png')).metadata();
const W = Math.round(H * (meta.width / meta.height));
const N = W * H;

await sharp(join(outDir, 'base.png')).resize(W, H, { fit: 'fill' }).jpeg({ quality: 88 }).toFile(join(outDir, 'base.jpg'));

/**
 * Caption + transition from the layer's provenance (recorded at stitch time in the app —
 * see InpaintLayerProvenance in client/src/inpaintLayers.ts). The chip visual language:
 *   plain string        = prompt pill (the edit's typed prompt, verbatim)
 *   stage tone base     = gray  "Starting image" chip
 *   stage tone skill    = teal  chip with the skill name
 *   stage tone finalize = pink-sparkle "Finalize pass" chip
 * A prompt/layer-name containing "finali[sz]e" upgrades the step to the finalize beat.
 */
const provFor = (i) => dumpMetadata?.states?.find((s) => s.index === i)?.provenance ?? null;

/**
 * The prompt bar is a capsule, not a paragraph. A prompt as typed ("i want her to have
 * something in her hair, maybe beads or something that go with") wraps to three lines and the
 * capsule swallows the frame — so the caption is the prompt CONDENSED to its instruction:
 * filename decoration stripped, thinking-out-loud hedges dropped, one clause, lowercase.
 *
 * This only ever SHORTENS: it never invents words the founder did not type. When a prompt needs
 * a genuine rewrite rather than a trim, put a `caption` on the state in metadata.json and that
 * wins outright.
 */
const CAPTION_MAX = 58;
const HEDGE = /^(?:ok(?:ay)?|so|um|please|can you|could you|i(?:'d| would)? (?:want|like|need)(?: (?:it|this|him|her|them))? to (?:have|be|get)|i want (?:it|this|him|her|them) to (?:have|be|get)|i want|lets|let's|make it so|maybe)\s+/i;
const TRAILING_VAGUE = /[,;]?\s*(?:or something(?: that (?:go|goes) with)?|or whatever|maybe something like that|and stuff|etc\.?)\s*$/i;

const condensePrompt = (raw) => {
  let text = String(raw ?? '')
    // filename-derived prompts arrive hyphenated and stamped: "…-2026-07-31-12-56-finished"
    .replace(/[-_]+\d{4}-\d{2}-\d{2}(?:-\d{2})*(?:-finished|-final)?$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\.(png|jpe?g|webp)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Drop the thinking-out-loud parts: a leading hedge, then a trailing "or something…".
  for (let pass = 0; pass < 3 && HEDGE.test(text); pass += 1) text = text.replace(HEDGE, '');
  text = text.replace(TRAILING_VAGUE, '').replace(/\s*,\s*$/, '').trim();
  // Still long? Keep the first clause — the instruction is almost always in front of the comma.
  if (text.length > CAPTION_MAX && text.includes(',')) text = text.slice(0, text.indexOf(',')).trim();
  if (text.length > CAPTION_MAX) {
    const cut = text.lastIndexOf(' ', CAPTION_MAX);
    text = `${text.slice(0, cut > 20 ? cut : CAPTION_MAX).trim()}…`;
  }
  return text.charAt(0).toLowerCase() + text.slice(1);
};
const isFinalize = (prov, layerName) =>
  prov?.op === 'finalize' || /finali[sz]e/i.test(prov?.prompt ?? '') || /finali[sz]e/i.test(layerName ?? '');
const tags = [{ text: 'Starting image', kind: 'stage', tone: 'base' }];
const REF_EXTS = ['png', 'jpg', 'jpeg', 'webp'];

const referenceExtCandidates = (ref) => {
  const out = [];
  const mime = String(ref?.mimeType ?? '').toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg') out.push('jpg');
  if (mime === 'image/png') out.push('png');
  if (mime === 'image/webp') out.push('webp');
  const name = String(ref?.sentName || ref?.originalName || '');
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  if (ext === 'jpeg') out.push('jpg');
  if (REF_EXTS.includes(ext)) out.push(ext);
  REF_EXTS.forEach((candidate) => out.push(candidate));
  return [...new Set(out)];
};

const referenceFromMetadata = (i, stateMeta) => {
  const ref = stateMeta?.references?.[0] ?? stateMeta?.provenance?.references?.[0] ?? null;
  if (!ref) return null;
  const slot = Number(ref.slot);
  const names = [];
  for (const ext of referenceExtCandidates(ref)) {
    names.push(`reference-${i}.${ext}`);
    if (Number.isInteger(slot) && slot >= 1 && slot <= 5) names.push(`reference-${i}-slot-${slot}.${ext}`);
  }
  const fileName = names.find((name) => existsSync(join(outDir, name)));
  if (!fileName) return null;
  return {
    image: `${publicUrl}/${fileName}`,
    label: ref.label || stateMeta?.referenceLabel || 'Reference',
    fileName,
  };
};

const edits = [];
for (let i = 1; i <= nStates; i++) {
  await sharp(join(outDir, `state-${i}.png`)).resize(W, H, { fit: 'fill' }).jpeg({ quality: 90 }).toFile(join(outDir, `cutout-${i}.jpg`));
  const edit = { reveal: `${publicUrl}/cutout-${i}.jpg` };
  const maskPath = join(outDir, `mask-${i}.png`);
  if (existsSync(maskPath)) {
    const { data, info } = await sharp(maskPath).resize(W, H, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    const alpha = Buffer.alloc(N);
    let count = 0, minX = W, minY = H, maxX = -1, maxY = -1;
    for (let p = 0; p < N; p++) {
      const a = data[p * ch + ch - 1];
      alpha[p] = a;
      if (a > 24) { count++; const x = p % W, y = (p / W) | 0; if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; }
    }
    const frac = count / N;
    if (frac > 0.6 || maxX < 0) {
      Object.assign(edit, { full: true, zoom: 1, cx: 0.5, cy: 0.5, maskSource: 'actual' });
      console.log(`edit ${i}: FULL reveal (mask ${(frac * 100).toFixed(0)}%)`);
    } else {
      // NB: sharp may return the blurred grayscale as 3 channels — read info.channels, don't assume 1.
      const { data: fd, info: fi } = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(BRUSH_BLUR).raw().toBuffer({ resolveWithObject: true });
      const fch = fi.channels;
      const rgba = Buffer.alloc(N * 4);
      for (let p = 0; p < N; p++) { rgba[p * 4] = 255; rgba[p * 4 + 1] = 255; rgba[p * 4 + 2] = 255; rgba[p * 4 + 3] = fd[p * fch]; }
      await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toFile(join(outDir, `brush-${i}.png`));
      const cx = +(((minX + maxX + 1) / 2) / W).toFixed(3), cy = +(((minY + maxY + 1) / 2) / H).toFixed(3);
      const broad = (maxX - minX) / W > 0.6 || frac > 0.16; // wide/big edit ⇒ don't punch in
      Object.assign(edit, { brush: `${publicUrl}/brush-${i}.png`, full: false, zoom: broad ? 1 : ZOOM, cx, cy, areaPct: +(frac * 100).toFixed(1), maskSource: 'actual' });
      console.log(`edit ${i}: local  cx=${cx} cy=${cy} area=${(frac * 100).toFixed(1)}%  zoom=${broad ? 1 : ZOOM}  brushBlur=${BRUSH_BLUR}`);
    }
  } else {
    Object.assign(edit, { full: true, zoom: 1, cx: 0.5, cy: 0.5 });
  }

  const stateMeta = dumpMetadata?.states?.find((s) => s.index === i) ?? null;
  const prov = provFor(i);
  const finalize = isFinalize(prov, stateMeta?.layerName);
  edit.transition = finalize ? 'finalize' : edit.full ? 'swipe' : 'brush';

  // Reference treatment: app dumps write reference metadata + files automatically.
  // Older/manual reels still work by dropping `reference-N.<ext>` into the reel folder.
  const metadataReference = referenceFromMetadata(i, stateMeta);
  if (metadataReference) {
    edit.reference = { image: metadataReference.image, label: metadataReference.label };
    console.log(`edit ${i}: reference <- ${metadataReference.fileName} (metadata)`);
  } else {
    for (const ext of REF_EXTS) {
      if (existsSync(join(outDir, `reference-${i}.${ext}`))) {
        edit.reference = { image: `${publicUrl}/reference-${i}.${ext}`, ...(stateMeta?.referenceLabel ? { label: stateMeta.referenceLabel } : {}) };
        console.log(`edit ${i}: reference <- reference-${i}.${ext}`);
        break;
      }
    }
  }
  if (finalize) {
    tags.push({ text: 'Finalize pass', kind: 'stage', tone: 'finalize' });
  } else if (prov?.op === 'skill') {
    tags.push({ text: prov.skillName ? `Skill · ${prov.skillName}` : 'Skill pass', kind: 'stage', tone: 'skill' });
  } else if (stateMeta?.caption || prov?.prompt) {
    // An explicit `caption` wins; otherwise condense the prompt as typed so the capsule stays small.
    const caption = stateMeta?.caption ? String(stateMeta.caption) : condensePrompt(prov.prompt);
    tags.push(caption);
    if (!stateMeta?.caption && caption !== prov.prompt) {
      console.log(`edit ${i}: caption condensed -> "${caption}"  (typed: "${prov.prompt}")`);
    }
  } else {
    tags.push(stateMeta?.layerName || `edit ${i} - replace with the typed prompt`);
    console.warn(`edit ${i}: no provenance in metadata.json — caption is a placeholder, edit reel.json tags[${i}]`);
  }

  edits.push(edit);
}

/**
 * AD beat (optional) — the reel ends on the ad YOU already made. Drop the exported ad into
 * the reel folder next to an `ad.json` naming it:
 *
 *   { "image": "ad.png", "label": "Turn into ad" }
 *
 * That is the whole contract. The ad is presented exactly as exported — the reel never
 * composes, overlays, re-types or re-colours it. `label` is just the stage chip's text.
 */
const adPath = join(outDir, 'ad.json');
if (existsSync(adPath)) {
  const ad = JSON.parse(readFileSync(adPath, 'utf8'));
  if (!ad.image) throw new Error(`${adPath}: an ad beat needs "image": the ad you already exported`);
  const { label, image } = ad;
  const adSrc = join(outDir, image);
  if (!existsSync(adSrc)) throw new Error(`${adPath}: image ${image} not found in ${outDir}`);
  // The ad comes from outside the state pipeline, so it is the one image whose aspect can
  // disagree with the reel. The layers are background-size: 100% (width-only), so a different
  // aspect paints SHORT and the previous frame shows through as bands. Refuse it by name rather
  // than distort the artwork or crop its copy - same rule as the cut-outs.
  const adMeta = await sharp(adSrc).metadata();
  const wanted = meta.width / meta.height;
  const got = adMeta.width / adMeta.height;
  if (Math.abs(got - wanted) > 0.01) {
    throw new Error(
      `${adPath}: ${image} is ${adMeta.width}x${adMeta.height} (${got.toFixed(3)}), but this reel is ` +
        `${meta.width}x${meta.height} (${wanted.toFixed(3)}). Export the ad at the reel canvas - ` +
        `a different aspect paints short inside the stage.`,
    );
  }
  await sharp(adSrc).resize(W, H, { fit: 'fill' }).jpeg({ quality: 92 }).toFile(join(outDir, 'ad-reveal.jpg'));
  edits.push({
    reveal: `${publicUrl}/ad-reveal.jpg`,
    full: true,
    zoom: 1,
    cx: 0.5,
    cy: 0.5,
    transition: 'ad',
  });
  tags.push({ text: label || 'Turn into ad', kind: 'stage', tone: 'ad' });
  console.log(`ad beat: ${image} (${adMeta.width}x${adMeta.height}) -> ad-reveal.jpg`);
}

writeFileSync(join(outDir, 'reel.json'), JSON.stringify({ base: `${publicUrl}/base.jpg`, tags, edits }, null, 2) + '\n');
console.log(`\nwrote ${join(outDir, 'reel.json')} (${W}x${H}, ${edits.length} edits + captions)`);
