---
name: refine-reels
description: Use when creating, updating, or planning an animated before→after "refine reel" for the Luvley marketing site or ads — the change-one-area refinement clips on the home page (replacing the swipers) or /use-cases, or any niche-targeted showcase clip. Use when turning layered in-app inpaint edits into a live RefineCase demo, picking a niche and starting image to build a showcase around, or wiring a new reel into a section.
---

# refine-reels

## Current reference automation override (2026-07-07)

The app dump is now the source of truth for references. Each stitched layer can carry `provenance.references`; `metadata.json` is v3; the dump writes the first display ref as `reference-N.<ext>` and all refs as `reference-N-slot-X.<ext>`. `from-dump.mjs` reads metadata first and only falls back to manual `reference-N.*` files for older reels. The current visual grammar is: every edit prompt caption renders inside the app-like bottom prompt bar, not the old floating prompt pill. Reference edits add a large readable ref preview, dock it into the small inline ref slot inside that bar, fade prompt text in as docking finishes, then keep prompt + ref visible through the overlapped brush/zoom/reveal and exit before the next beat. Non-reference edits use one stable fixed-size bottom prompt bar with no ref tray: adjacent prompt beats delete the old text and type the next prompt inside the same bar without resizing the surface. After typing finishes, hold a short read beat of about 0.25s before starting the next app action so the eye is never split between the final letters and the swipe/brush/reveal. "App Action" pacing keeps the prompt text, compare divider, selection brush, camera move, and reveal handing off so something app-native is always moving. New reels should not hand-style prompt chip widths or rely on the old floating prompt pill grammar. This supersedes any older "floating ref card" or prompt-pill wording below.

Produce a niche-targeted before→after clip: pick who it's for, build the refinement by hand in the app, then turn the dumped layers into a live reel the site animates (`ReelPlayer`). It is **not** a video file — it plays live, so it stays razor-sharp and responsive.

**Canvas target for website + social reels:** default every new generated base image to vertical **4:5 at 1280×1600px**. This is the site-category/reel card standard (`ring-reference` is 1280×1600; candle is effectively 4:5). When generating a candid starting image from a brief, prompt for a vertical 4:5 composition and export/use it at 1280×1600 before building the layer stack. Keep `base`, every `state-N`, every `mask-N`, references used as reel assets, and any finalize image pixel-aligned to that same canvas unless a specific placement explicitly requires another aspect.

## THE AD-REEL TEMPLATE — `jewelry-on-model` (founder-locked 2026-07-31)

**`jewelry-on-model` is the reference implementation for every ad reel. Copy its beat order and
its pacing; do not re-derive them.** The founder built it beat by beat and signed off: *"this is a
good template to base future ones on."*

| # | Beat | Transition | What it proves |
| --- | --- | --- | --- |
| 1 | Starting image | — (gray `Starting image` chip) | the unglamorous phone photo he actually started from |
| 2 | The generation | `swipe` (compare divider) | phone photo → campaign image, in one prompt |
| 3 | The refinement | `brush` (pink selection → punch in → reveal) | one area changed on purpose, mask visible |
| 4 | Finalize | `ad` beat, first half — `✦ FINALIZE` chip + sparkle sweep | the finishing pass |
| 5 | The ad | `ad` beat, second half — `TURN INTO AD` chip, artwork resolves and HOLDS | the finished ad he already made |

Runs ~18s. Beats 4 and 5 live in one `ad` beat (`scheduleAdBeat` in `ReelPlayer.tsx`) because the
finalize half needs no reveal image of its own — it sweeps over the finished frame.

**The pacing rule — separate the TRANSITION from the DWELL.** Three rounds of founder notes landed
on this, and getting it wrong once cost a round: *"the finalize transition is fine being fast, I'm
talking about the pause on the new finalize image — needs to feel slow enough for them to take it
in."* A transition is not content. Sweeps, wipes and sparkle passes stay **quick** (the finalize
sweep is 0.4s and fully clear by ~1.26s); what runs long is the **still frame after** it, so the eye
can actually read the result — the finished frame then sits under its chip for ~2.2s before the ad
is even named. Slowing a transition to buy that time reads as sluggish, not considered.

The end of a reel is where the eye wants to rest, so the dwells grow toward the tail: the ad
resolves over ~2s, settles over ~2.75s, then holds ~3.1s before the loop. Beats 1–3 are tuned and
were signed off unchanged; **if a new reel feels rushed, lengthen a dwell in the tail — never a
transition, and never the head.** Every value lives in `REEL_TIMING.ad` with the reasoning in
comments; change them only on a fresh founder note.

**What the founder supplies, and what you must never invent:** he exports the stills and he makes
the ad. You animate between them. Do not compose ad copy, do not vectorize, do not build an ad —
that was tried and rejected outright (*"There's no need for you to invent shit… I did all the work.
All you have to do is turn it into a video"*). The ad is an image; the `ad` beat reveals it.

## THE WORKFLOW — what he does, what you do

**His half, in the app.** Export as he works, all to Downloads, nothing renamed:

1. the **starting image** — the unglamorous phone photo (export it, or tell you where it is)
2. each **generation / edit**, one export per step
3. the **finalize** — the app names it `…-finished.png`
4. the **ad** — made in the app; already finished artwork

Then: *"build a reel called `<name>`"*.

**Your half, in one command.** Never hand-assemble:

```
node .claude/skills/refine-reels/ingest.mjs --name <name> --dry     # show him the table
node .claude/skills/refine-reels/ingest.mjs --name <name> --wire    # build + register
```

Show him the `--dry` table, fix any flag he corrects, run it for real, then send him
`/reels?only=<name>`. Screenshots are for your own verification — he watches the link.

**Adding an ad to a reel that already exists** (any reel, including ones built before this
pipeline — they have no `state-N.png` to rebuild from, and an ad beat does not need one):

```
node .claude/skills/refine-reels/ingest.mjs --name candle --add-ad ad-feed-finished.jpg
```

It sizes the ad to that reel, appends the beat and the `Turn into ad` chip, and re-running it
replaces the ad rather than stacking a second one. If the reel's chips are overridden in
`ReelsPage.tsx` it says so — reel.json must own the tags or an appended beat gets no chip.

**Three things you never do:** compose ad copy, invent a caption for a beat whose prompt you do not
have, or claim a mask is his brush when it was derived. Ask; he answers in seconds.

## START HERE — `ingest.mjs` builds a reel from his exports in one command

**Do not hand-assemble a reel from the founder's exports. Run this first, always.** It exists
because doing it by hand cost an hour: hunting his Downloads folder, guessing which export was the
starting image, which was the ad, what order they went in, and what he had typed. All of that is
recoverable from the files.

```
node .claude/skills/refine-reels/ingest.mjs --name <reel> --dry     # plan only — SHOW HIM THIS
node .claude/skills/refine-reels/ingest.mjs --name <reel> --wire    # build + register it
```

It collects the recent images from his Downloads, orders them, classifies each beat, derives the
masks, writes the dump layout, runs `from-dump.mjs`, and registers the reel in `ReelsPage.tsx` and
the vite allowlist. Then send him `/reels?only=<reel>`.

**`--dry` first, every time.** It prints a table — beat, kind, how much changed, caption, source
file — and that table is what he confirms. Correcting one flag costs him five seconds; watching a
wrong reel costs a round trip.

| Flag | Use it when |
| --- | --- |
| `--base <path>` | the starting image is not in Downloads (a repo asset, an older shot) |
| `--skip <text>` | Downloads holds files from another reel — matches any part of the filename |
| `--ad <file>` / `--ad none` | two ads in the folder, or the reel does not end on one |
| `--from <dir>` / `--since <hours>` | exports live elsewhere, or the batch is older than 12h |
| `--order a.png,b.png,…` | nothing else worked; you state the beats yourself |
| `--brush-blur <px>` | the derived selection reads too hard or too soft |

**A rebuild fully replaces the previous one.** Stale `state-N`/`mask-N`/`ad.json` are cleared
first, because `from-dump.mjs` walks `state-1, state-2, …` until one is missing — without the
sweep, a shorter rebuild inherits the old tail and grows a beat nobody asked for.

**How it decides, and where it can be wrong:**

| Question | Signal | When it fails |
| --- | --- | --- |
| Beat order | the timestamp **inside** the filename — `canvas-1785516972656`, `1785517725459-…-openai-…`, `…-2026-07-31-12-56-finished` | falls back to file mtime for foreign files; use `--order` |
| Which is the ad | last in order **and** flatter than the photos before it (laid-out type reads high) | two ads in one folder — pass `--ad` |
| The prompt | the app stamps it into the export filename, then it is condensed | provider/canvas exports carry none → `⚠ no prompt`, **ask him, never invent** |
| Swipe vs brush | how much of the frame changed between consecutive states (>16% ⇒ full regeneration) | — |
| **Finalize** | named `-finished` **and** the grade signature: almost every pixel nudged, almost none moved far | a `-finished` name alone is not enough — a re-save would qualify |
| The mask | consecutive-state diff, grown to brush size | it is DERIVED, not his real stroke |

**A finishing pass is a GLOBAL, LOW-AMPLITUDE change and a local-edit diff cannot see it.** The
first build of `jewelry-on-model` measured a real finalize as *0.0% changed* and dropped the beat
entirely — the founder had to point at the file himself. Two separate measurements are taken per
pair for exactly this reason: how many pixels moved *far* (a local edit) and how many moved *at
all* (a grade). Never conclude "nothing changed" from the first number alone.

**Mixed timestamp resolutions bite.** Wall-clock stamps are minute-resolution and epoch stamps are
millisecond, so a `-finished` export once sorted ahead of the canvas it was finished from. Wall
stamps are anchored to the END of their minute: these are derived exports, so when the order is a
coin toss, later is the right answer.

**Never sort by file mtime.** That is when a file was last *downloaded*; re-downloading one export
silently reorders the reel. The self-test caught it putting the ad before the generation it came
from. The embedded stamp is the creation time and is the only trustworthy order.

**Two warnings it prints are load-bearing:**
- *"base and beat 1 differ by only N%"* — the first export is a state, not a starting image. His
  real before-shot was probably never exported. Ask, or pass `--base`.
- *"⚠ no prompt"* — the caption is unknown. Ask him what he typed. A caption you made up is the
  fastest way to have the whole reel rejected.

**The in-app dump is still better when it matters.** Developer view → *Dump layer stack →
refine-reel* (`Ctrl+Alt+R`) writes the true masks and the prompts as typed, with no guessing at
all. Ingest is for the export-to-Downloads flow he actually uses day to day; reach for the dump
when a reel must show an exact selection.

## The loop (per reel)

1. **Target** — write the brief. Fixes "showing the wrong thing" before spending any effort.
2. **Produce** — build the layered refinement in-app, then one-click dump (the founder's hands-on part).
3. **Assemble** — run `from-dump.mjs` on the dump → `reel.json`.
4. **Wire + review** — one line in `REEL_BY_SLUG`/`REELS`, watch it live, tune per the playbook below.

## THE APPROVED PLAYBOOK (founder-locked on the candle, 2026-07-06)

**Current prompt-bar rule (2026-07-07):** prompt captions render inside `.lv-reel__promptbar` for every edit beat. Reference edits add the large-preview-to-inline-ref-slot animation inside that same bar and keep the fixed ref-slot layout. Non-reference edits use one persistent stable no-ref bottom bar: when moving prompt-to-prompt, delete the old text, type the new text, keep the bar size steady, give the completed prompt a short read beat, then start swipe/brush/zoom/reveal from that same bar. Do not hand-style prompt bar widths or rely on the old floating prompt pill grammar.

The candle reel on `/use-cases#ecommerce` is the reference implementation. Every new reel copies this grammar exactly — do not re-derive it, do not re-fight these battles:

**Caption grammar — prompt bar for prompts, STAGE CHIPS for process steps (founder-updated 2026-07-07; supersedes "every chip is a prompt").**
Captions are a visual language translating app state into a reel. Two caption kinds (`ReelCaption` in `ReelPlayer.tsx`; prompt bar styles `.lv-reel__promptbar*`, stage styles `.lv-reel__tag--*` in `ReelPlayer.css`):
- **Prompt bar** (a plain string tag or `kind: 'prompt'`) = the literal prompt the user typed for that edit, lowercase, imperative: `"turn her head toward the ocean light"`. It renders inside the app-like bottom prompt bar for every edit beat. Never a selling point, never a process label.
- **Stage chip** (`{ text, kind: 'stage', tone }`) = a process step that is NOT a prompt:
  - `tone: 'base'` → **gray** — `tags[0]` is always `{ text: 'Starting image', kind: 'stage', tone: 'base' }` (the old prompt-style `"the original phone photo"` descriptor is retired).
  - `tone: 'skill'` → **teal** — the edit was driven by an armed skill; text = `Skill · <name>`.
  - `tone: 'finalize'` → **pink sparkle** — a finishing pass; pairs with the `finalize` transition (sparkle sweep) instead of swipe/brush.
  - `tone: 'ad'` → **ink glass, gold caret** — the reel lands on the finished ad; pairs with the `ad` transition (see *The AD beat* below). Deliberately outside the pink family, and it fades as the ad arrives so nothing sits on top of it.
- Don't mix registers within a kind: prompt-bar captions read as typed prompts, stage chips read as process labels.

**Zero-touch captions — provenance flows from the app; do NOT hand-author reel.json.**
Every inpaint stitch records `provenance` on the layer (`InpaintLayerProvenance` in `client/src/inpaintLayers.ts`, set by both runners `runNanoBananaInpaint.ts` / `runKleinInpaint.ts`): `op` (`generation` full-frame | `refine` brushed | `skill` armed-skill | `finalize`) + the prompt AS TYPED (pre skill-rewrite) + `skillName`. The dump writes it into `metadata.json` (v2), and `from-dump.mjs` auto-authors `tags` + per-edit `transition` from it: gray base chip → prompt pills / teal skill chips → pink finalize chip. Finalize is detected from `op: 'finalize'` or "finalize" appearing in the prompt or layer name — so the founder marks a finishing pass by simply typing "finalize …" in the prompt (or renaming the layer). Layers made before the hook (or tool layers: paste, isolate, background copy) have no provenance → the builder emits a placeholder caption and warns; only then edit `tags` by hand.

**Reference treatment (founder-locked on the ring-reference template, 2026-07-07).**
When an edit used reference images, the reel shows them with the app's add-reference gesture: the ref image appears large and readable, holds briefly, then docks into the small inline reference slot inside the same bottom prompt bar used for every prompt caption. The prompt text fades in as docking finishes; prompt + ref stay visible while the selection paints, the camera punches in, and the result reveals; then the whole prompt bar fades out before the next beat. Non-reference edits use the same prompt bar with no ref tray. Never flash a reference in-and-out before the edit (rejected: "pops up really fast and then disappears"). Wiring is zero-touch: `from-dump.mjs` reads `metadata.states[N].references[0]` first, then falls back to older `reference-N.*` files. Captions also **crossfade between every beat** (instant text swaps rejected). The **`ring-reference` reel on `/reels` is the template reference implementation** of the full grammar: gray base chip → bottom prompt bar + inline reference + pink selection → second ref beat → pink-sparkle finalize; built from `marketing/public/assets/launch/refinement/` (the home change-one-area assets) via `scratchpad build-ring-reference` pattern — states composed from cutouts, cutout alpha = mask.

**Non-reference App Action pacing (founder-updated 2026-07-07).**
Plain prompt beats cannot sit still after the prompt bar arrives. Keep the stable prompt bar alive across adjacent plain prompt edits: erase the previous prompt, type the next prompt, hold about 0.25s for readability, then let the app action pick up without resizing the bar. Use the balanced no-ref rhythm so the full prompt reads before the action starts. Full-image passes preload the compare divider after that read beat, then sweep immediately. Brush passes start the pink selection after the new prompt reads, then overlap camera zoom and reveal. Finalize stage chips remain stage chips, but the sparkle/reveal starts quickly enough that the chip feels connected to the action. Keep exits short; avoid empty holds between beats.

**Visual grammar — the edit TYPE must be readable at a glance.**
- **Full regeneration (edit 0, the whole-frame transform) = compare SWIPE.** Clip-path wipe, divider line with round handle (like the app's compare mode) sweeping left→right. No selection shown.
- **Refinement pass (every edit after) = pink inpaint SELECTION.** Settle at full frame → the selection paints on → punch in (compact edits only; wide edits stay full frame) → hold so it reads → result crossfades in as the selection lifts.
- **Finishing pass = pink-sparkle FINALIZE.** A sparkle sweep crosses the frame as the finished state resolves.
- **The ad = the AD beat, and it is always last.** See below.
- This is deliberate teaching: the audience learns "swipe = new generation, pink blob = masked refinement". Keep the mapping pure — never swipe a refinement, never brush a regeneration.

**Reference treatment (founder-locked on the ring-reference template, 2026-07-07).**
When an edit used reference images, the reel shows them with the app's add-reference gesture: the ref image appears large and readable, holds briefly, then docks into the small inline reference slot inside the same bottom prompt bar used for every prompt caption. The prompt text fades in as docking finishes; prompt + ref stay visible while the selection paints, the camera punches in, and the result reveals; then the whole prompt bar fades out before the next beat. Non-reference edits use the same prompt bar with no ref tray. Never flash a reference in-and-out before the edit (rejected: "pops up really fast and then disappears"). Wiring is zero-touch: `from-dump.mjs` reads `metadata.states[N].references[0]` first, then falls back to older `reference-N.*` files. Captions also **crossfade between every beat** (instant text swaps rejected). The **`ring-reference` reel on `/reels` is the template reference implementation** of the full grammar: gray base chip → bottom prompt bar + inline reference + pink selection → second ref beat → pink-sparkle finalize; built from `marketing/public/assets/launch/refinement/` (the home change-one-area assets) via `scratchpad build-ring-reference` pattern — states composed from cutouts, cutout alpha = mask.

**Non-reference App Action pacing (founder-updated 2026-07-07).**
Plain prompt beats cannot sit still after the prompt bar arrives. Keep the stable prompt bar alive across adjacent plain prompt edits: erase the previous prompt, type the next prompt, hold about 0.25s for readability, then let the app action pick up without resizing the bar. Use the balanced no-ref rhythm so the full prompt reads before the action starts. Full-image passes preload the compare divider after that read beat, then sweep immediately. Brush passes start the pink selection after the new prompt reads, then overlap camera zoom and reveal. Finalize stage chips remain stage chips, but the sparkle/reveal starts quickly enough that the chip feels connected to the action. Keep exits short; avoid empty holds between beats.

**Visual grammar — the edit TYPE must be readable at a glance.**
- **Full regeneration (edit 0, the whole-frame transform) = compare SWIPE.** Clip-path wipe, divider line with round handle (like the app's compare mode) sweeping left→right. No selection shown.
- **Refinement pass (every edit after) = pink inpaint SELECTION.** Settle at full frame → the selection paints on → punch in (compact edits only; wide edits stay full frame) → hold so it reads → result crossfades in as the selection lifts.
- **Finishing pass = pink-sparkle FINALIZE.** A sparkle sweep crosses the frame as the finished state resolves.
- **The ad = the AD beat, and it is always last.** See below.
- This is deliberate teaching: the audience learns "swipe = new generation, pink blob = masked refinement". Keep the mapping pure — never swipe a refinement, never brush a regeneration.

**The AD beat (added 2026-07-31) — the reel ends on the ad the founder ALREADY MADE.**

> Founder, 2026-07-31: *"You do not need to recreate the ad. The ad is already made. All you have
> to do is add a nice animated transition between the still images... There's no need for you to
> invent shit, vectorize shit, turn it into ad, make the ads yourself. I did all the work."*

The last beat presents a finished ad **exactly as exported**. The reel never composes, overlays,
re-types, re-colours or re-crops it, and it never writes ad copy. (A first pass built a live-text
ad composer — brand line, kicker, headline stagger, CTA pill. Rejected. Do not rebuild it.)

The motion: a light sweep crosses the frame while the ad resolves out of a slight push-in, so it
lands like a piece being placed rather than a plain cross-fade. The `tone: 'ad'` stage chip names
the beat and clears as the artwork arrives, so nothing sits on top of the ad. The reel then holds
on it.

**Wiring — one file:** put the exported ad in the reel folder next to an `ad.json` naming it.

```json
{ "image": "ad.png", "label": "Turn into ad" }
```

`from-dump.mjs` does the rest. It refuses an ad whose aspect differs from the reel by more than 1%
(naming both sizes): the layers are `background-size: 100%` (width-only), so a mismatched ad paints
short and the previous frame shows through as bands.

`marketing/src/refine/reelAdBeat.contract.test.ts` fails if an ad beat loses its image, stops being
the last beat, or its caption stops being the ad stage chip.

**The whole job, when the founder hands over a folder of stills.** This is the common case and it
should take minutes, not hours. Do not generate images, do not write copy, do not invent beats:

1. `base.png` ← his starting image. `state-1.png`, `state-2.png`, … ← each later still, in order.
   `ad.png` ← the finished ad. All in `marketing/public/assets/launch/reels/<name>/`.
2. `metadata.json` with one `states[]` entry per still carrying `provenance.prompt` — **the prompt
   he typed**. The app's exports usually carry it in the filename
   (`I-want-her-to-have-something-in-her-hair-…-finished.png`), so read it off there rather than
   inventing a caption.

   **The capsule is a caption, not a transcript** (founder, 2026-07-31: *"that capsule is just
   big, and that's what I don't like"*). A prompt as typed wraps to three lines and the prompt bar
   swallows the frame. `from-dump.mjs` condenses automatically — filename stamps stripped, leading
   hedges ("i want her to have…") and trailing "or something that go with" dropped, first clause
   kept, 58 chars max — and logs what it did next to what was typed. Condensing only ever removes
   words. When the result still is not a clean lowercase imperative, put a `caption` on the state
   and it wins outright:

   ```json
   { "index": 1, "caption": "add beads in her hair",
     "provenance": { "op": "refine", "prompt": "i want her to have something in her hair, maybe beads or something that go with" } }
   ```
3. `ad.json` as above.
4. `node .claude/skills/refine-reels/from-dump.mjs --out <that folder>`
5. One line in the `REELS` list in `ReelsPage.tsx`, and `assets/launch/reels/<name>` in
   `NON_PRODUCTION_ASSET_ROOTS` (`marketing/vite.config.ts`) until it goes on a real page.
6. **Send the founder the link, not screenshots.** `/reels?only=<name>` plays that one reel large
   and on its own; bare `/reels` is the whole board. Stills are for your own verification — he
   needs to watch it move.

Stills with no `mask-N.png` get the compare-swipe beat, which is correct for a whole-frame change.
Only a dumped layer stack has real masks, and only then does the pink selection appear.

**Selection styling (locked values, in `ReelPlayer.css` — don't drift):**
- Fill `rgba(232, 92, 178, 0.38)` — softer than the app's own quick-mask; 0.5 read too strong on-site.
- Soft diffuse halo, **no crisp ring**: `drop-shadow(0 0 8px rgba(255,255,255,.5)) drop-shadow(0 0 18px rgba(232,92,178,.4))`.
- Shape = **round radial dab** with a wide feather (dense core → soft edge), like the app's brush. Never a box / rounded rectangle — that read as a marquee tool and was rejected.
- Coverage = the whole region being edited, generously (founder brushes big). E.g. the flame selection spans from the candle rim to the top of the frame, not just around the wick.
- Display brush generation is intentionally softer than the raw app mask. Keep the dumped `mask-N.png` exact, but render `brush-N.png` from an **averaged / heavily blurred alpha** so the site reads as a soft pink wash, not a hard selection. Default builder blur is about `height / 24` (`~68px` at `1600px` tall); override with `--brush-blur <px>` only when reviewing a specific reel.

**If a dumped mask needs reshaping** (wrong place / boxy / too tight), regenerate the `brush-N.png` as a radial ellipse — sharp script pattern: alpha `= 255 * (1 - smoothstep(coreFrac, 1, d))` where `d = √((x−cx)²/rx² + (y−cy)²/ry²)`, with `coreFrac ≈ 0.45` for the candle's soft look. Write white RGB + that alpha at the same canvas size as the existing mask. (Candle flame: `cx .50, cy .17, rx .37W, ry .32H`.)

**Stage:** every reel sits in `.lv-reelstage` — the editor's bottom-prompt-bar glass (rose gradient, `blur(14px)`, pink hairline, inset+glow shadow, concentric 36px radius). **Static — no shimmer, no drift** (rejected as distracting).

**The seek recipe cannot see loop bugs — check the wrap separately.** `tl.seek(t, false)` renders
with events ENABLED, so every `onUpdate` fires and the frame always looks right. GSAP's real repeat
rewinds with events SUPPRESSED, so anything the reel writes to the DOM from inside an `onUpdate`
(the camera: `background-size` / `background-position`) is NOT restored by the rewind. Drive
`tl.totalTime(duration - 0.05)` then `tl.totalTime(duration + repeatDelay + 0.3)` and read the base
layer's inline `backgroundSize`: it must be back to `100%`. This is how the ad beat's stale-crop bug
was found after the screenshots looked perfect (fixed by `resetCamera` at the head of the loop).

**Verification recipe** (GSAP freezes rAF playback in background/headless tabs; `preview_screenshot` times out in this env):
run **headless** Playwright from `client/` (it has `playwright-core` + cached Chrome — headless avoids the desktop window the founder can accidentally close): goto the page, `tl = window.__reelTls[jsonUrl]; tl.pause()`, then per beat `tl.seek(0, false); tl.seek(sec, false)` — **`seek(t, false)` applies styles AND fires the crossed `.call()` captions synchronously**, so stills show the correct chip (plain `tl.time(t)` leaves captions stale on backward seeks). Wait ~400ms for image decode, screenshot the `.lv-reelstage`. Vite may force-reload the page (dep optimization) — wrap in a retry-from-goto loop.

## 1. Target — get a goal before building

Write ONE line for the niche:

`Niche — buyer: [who] · job: [what they're always trying to do] · prove: [what the app does better/faster] · before→after: [the concrete change]`

- The 6 locked niches (buyer, job, before→after) are canonical in `marketing/src/content/copy.useCases.ts`. Per-niche **marketing goals + starting-image ideas** are in [niches.md](niches.md) — read it. Use the `ogilvy` skill if the pitch needs punch.
- **Starting image** = what the buyer would *actually* start with — an unglamorous amateur phone shot. The dull "before" is what makes the transformation sell. Get it by generating a realistic before via `docs/launch/asset-pipeline/gen.mjs` (prompt style: `"Casual amateur smartphone photo of ..."`), or sourcing a real photo. Default website/category/ad reel bases to vertical 4:5 at **1280×1600px**; generate or crop the first image to that size before loading it into the app so the dumped layer stack lands cleanly in the site player.

## 2. Produce — in-app (hands-on)

Build the real refinement so the reel is genuine app output:

1. Load the base at the reel canvas target, normally vertical 4:5 at **1280×1600px**. **Don't resize/recompose the doc after this** — every layer must stay pixel-aligned to it.
2. Inpaint each area you want to show as its **own layer**. **One area per layer** — each layer becomes one reveal. **Every step you want in the reel must exist as a layer in the stack at dump time** — don't flatten, don't merge, don't replace the base mid-build. A step that isn't in the stack can't be dumped, and its real mask is gone (this is exactly what happened to the Fashiondesign1 head-turn: the dump had only the 2 full-generation layers, so the head-turn's display mask had to be synthesized — re-produce + re-dump to fix it). Full generations count too: run them as full-image inpaint (no mask) so they land as layers. Brushed refinements keep the exact brushed selection as the layer mask — that IS what the reel renders. Mark a finishing pass by typing "finalize …" in its prompt.
3. Verify the composite reads cleanly (this is why it's hand-built, not scripted).
4. When the layer stack is built, **dump it — one click:** **Developer view → "Dump layer stack → refine-reel"** (enable the Developer view: set `gds.userPreferences.v1` → `developerViewEnabled:true` in localStorage; button lives in the always-visible top section). Also **Ctrl+Alt+R**, or `window.__refineReels.dump('<name>')`. The app writes, into `marketing/public/assets/launch/reels/<name>/`: `base.png` (the before) + `state-N.png` (each cumulative flattened state — the app's compositor lands each cropped patch at its bbox) + `mask-N.png` (**each layer's real working-size mask = the exact brushed selection**) + `metadata.json` (per-layer provenance: op / typed prompt / skill name, plus mask stats). Zero manual exports. **Read the dump's ⚠ warnings** (shown in the panel status + hotkey alert): a refine whose mask covers ~the whole frame, or a layer with no provenance, means the reel won't show your real brush / caption — fix in-app and re-dump rather than patching the reel afterward.
   - *Wiring:* button in `DeveloperViewPanel.tsx`; shared `handleDumpRefineReel` callback in App.tsx (also feeds the hotkey + `window.__refineReels`); endpoint `POST /api/refine-reel/dump` in server/index.js.
   - *Data decision:* flattened cumulative states + working-size masks — NOT raw patches+bbox (the compositor already places cropped patches; reconstructing that is fragile).

## 3. Assemble

**Primary — from an app dump** (`Ctrl+Alt+R` wrote `base.png` + `state-N.png` + `mask-N.png`):

```
node .claude/skills/refine-reels/from-dump.mjs --out <reelDir> [--height 1600] [--zoom 1.8]
```

Reveals = the cumulative states (crossfade over the previous ⇒ only the edit shows); **brush = each layer's real mask, feathered** (the exact brushed area — non-deceptive); per-edit `zoom`/`full` auto-decided (whole-frame mask ⇒ full reveal, no zoom, no brush; broad edit ⇒ stay full-frame so all elements show; compact edit ⇒ punch in); **`tags` + per-edit `transition` auto-authored from `metadata.json` provenance** (gray Starting-image chip, prompt pills verbatim, teal `Skill · <name>` chips, pink Finalize chip → `finalize` transition). Writes a complete `reel.json` — `ReelPlayer` reads the embedded tags, so wiring needs no caption list. This is the accurate, repeatable path: **app → dump → from-dump.mjs → done.** Only hand-edit `tags` when the builder warned about a missing-provenance layer.

*Older capture paths remain but are superseded by the dump:* `assemble.mjs` (transparent per-layer PNGs; `--selfcheck` self-tests it) and `from-canvases.mjs` (canvas-state diffs; under-measures the mask — hand-expand the brush).

```
node .claude/skills/refine-reels/assemble.mjs <reelDir> [--zoom 1.8]
```

Reads `base.*` + `cutout-N.png`, derives each area's centre + size from its opaque pixels, and writes `reel.json` (a `RefineCase`). Put the folder under `marketing/public/assets/launch/reels/<name>/` so the URLs resolve (otherwise pass `--base-url`). Sanity check the tool anytime with `--selfcheck`.

### From canvas states — the clean path (proven on the candle)

Transparent per-layer export is finicky. The reliable capture: in-app, **export the whole canvas after each refinement** (cumulative states) and keep the original "before". Then:

```
node .claude/skills/refine-reels/from-canvases.mjs --out <reelDir> --base <before> --states s1.png,s2.png,s3.png
```

It diffs consecutive frames to locate each edit and writes: **full-state reveals** (each next state crossfades over the previous — since only the edited region differs, only it changes ⇒ always crisp, no mask artifacts), a **soft pink brush mask** (an ellipse sized to the real change bbox — right place + size), and `reel.json`. A near-whole-frame diff (a full generation) is flagged `full` ⇒ full-frame reveal, no zoom. Render/tune with the self-contained **`preview.html`** in the reel folder, served live at `http://localhost:5174/assets/launch/reels/<name>/preview.html` (GSAP timeline; the tab must be foreground to animate — for headless checks seek via `window.__tl`).

### Accuracy: the brushed selection is BIGGER than the visible change

The founder brushes a **large** area but only part of it visibly changes (smoke, flowers). So **diffing the result under-measures the real selection** — a reel built from a canvas-export diff will show a brush that's too small, which reads as deceptive. Two ways to get the true selection:

- **Accurate (preferred): Transparent BG export.** Isolate the layer → Export → **Transparent BG** → PNG. The see-through **alpha IS the exact mask** — the whole brushed region, even where pixels barely changed (the app fills the entire masked area). `assemble.mjs` reads that alpha directly for both the reveal and the brush. This is the non-deceptive, repeatable path.
- **Fallback: canvas-export diff** (`from-canvases.mjs`) when transparent export isn't available — but the brush region must then be **hand-expanded to the real brushed area** (e.g. flame = whole middle-top, styling = most of the tabletop), since the diff only sees the visible change.

## 4. Wire + review

- **Site player (the live engine): `ReelPlayer`** (`marketing/src/refine/ReelPlayer.tsx`) — React+GSAP, reads any `reel.json` by URL. Behavior + styling are locked by **THE APPROVED PLAYBOOK** above (prompt captions; swipe = full regen; round soft pink selection = refinement; static glass stage).
  - **Wire a new reel = one line in `REEL_BY_SLUG`** (UseCasesPage.tsx, the live /use-cases slot per niche) and/or the `REELS` list (ReelsPage.tsx, the `/reels` review board, unlisted like `/board`). Dev seek hook: `window.__reelTls[<jsonUrl>].pause()/.time(sec)`.
- **Old engine (existing sections only):** `RefineVisual`/`buildRefineFrames` in `refineCase.ts` — still used by /how-it-works, home #refine, and the not-yet-converted /use-cases niches. Don't wire new reels through it; the swiper-swap grid reuses `ReelPlayer`.
- **Many reels (home-swiper replacement):** a grid of `ReelPlayer`s. Build that grid only when actually swapping the swipers — don't pre-build it.
- **Preview:** launch the marketing site (`website` launch config) and open `/reels`. Ports drift when old vite procs linger (site has landed on :5174/:5175/:5176) — check the vite banner/preview_logs for the real port. Direct changes — bigger/smaller change, different order, different starting image — then rebuild.

## Selection → zoom → brush (why this beats the old reels)

Each cut-out's **opaque alpha is the real brushed selection** for that layer — nothing extra to capture. From it:
- **Where to zoom** — the opaque region's centre (`cx,cy`, derived by the assembler).
- **How far to punch in** — the opaque bbox (the patch *tile*) is the natural zoom extent: frame the tile.
- **The brush-overlay shape** — trace that real silhouette, **softened** (feathered edge), not the hard in-app edge and not a generic blob.

This is the fix for the old reels, where the on-screen selection didn't match what actually drove the result. When a brief says *"showcase the refinement brush/mask,"* render the feathered silhouette prominently on the paint beat.

*Engine note:* the shipped `buildRefineFrames` still uses a generic soft brush blob sized to `areaPct`. Rendering the true softened silhouette + tile-fit zoom is the upgrade to make when building the first real reels — the data is already in the cut-out.

## Gotchas

- One area per layer, or two changes collapse into a single reveal.
- Base + every cut-out must share the base's exact pixel size — the assembler enforces this and will refuse a mismatch.
- Cut-outs must be **transparent PNGs** (Transparent BG on), not flattened JPGs — the transparency *is* the reveal mask.
- Zoom is `background-size`, never `transform: scale` — the engine already does this; don't "fix" it.

## Future: MP4 for ads (not built)

On-site reels stay as live `RefineCase`s. Paid ads need an actual file — capture the live clip headless (`playwright`) + ffmpeg. Build only when ads need it.
