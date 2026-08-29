---
name: generate-app-images
description: Fast batch image generation through the app's production pipeline (Director + Atlas render) for skill evals, preview pairs, contact sheets, or any "run this skill / prompt and show me the image" task. Use whenever images must be generated from the RunningHub/Luvley app — never drive the canvas UI for batch renders.
---

# Generating app images fast

One image should take ~10s to render (Nano Banana 2) plus ~15–20s of Director
prompt-writing per RUN (not per image). A 4-skill × 3-take round is ~2 minutes
wall time when parallelized. If a plan looks like it will take 30 minutes,
the plan is wrong — use the path below.

## The fast path: eval-launch-skill.mjs (no UI, no dev server)

Runs the REAL production path headlessly: store-skill resolution (seam fields
included) → Prompt Director (`runCards`) → Atlas image render. Loads keys from
`server/.env` itself; the backend does NOT need to be running.

```
node server/scripts/eval-launch-skill.mjs \
  --skill-name "Campaign Product Hero" \        # or --skill-id skill_xxx
  --image marketing/public/assets/launch/results/pairs/candle-before.jpg \
  --prompt "make this into an ad" \             # weak on purpose for skill evals
  --count 3 --preset nb2 --label my-round-1
```

- `--preset nb2` = Nano Banana 2, ~10s/image — the default for drafts and
  review rounds. `pro` is slower/higher-quality — founder-taste finals only.
  ALWAYS pass `--preset` for batches; omitting it inherits whatever the studio
  is currently set to (often `pro`) and silently triples render time.
- Artifacts → `.data/eval-golden/<label>/<skillId>/`: `input.png`,
  `take-N.txt` (title + finalPrompt), `take-N.png`, `meta.json`.
- Test inputs live in `marketing/public/assets/launch/results/pairs/*-before.jpg`
  (candle, coffee-launch, fragrance, device, fashion, handbag-campaign,
  beauty-water, ceramic-editorial…). Look at an image before picking it.

## Parallelize across runs, not inside one

Renders inside one run are sequential (fine — 3 takes ≈ 30s). Launch one
background process per skill/case and let them race:

- Claude Code: one `Bash` call per run with `run_in_background: true`, all in
  a single message. You are notified as each completes.
- 4–6 concurrent runs is proven safe; don't go 20-wide (provider rate limits).
- The runs are resumable by design — `run-preview-batch.mjs` skips cases whose
  `take-1.png` already exists; mirror that if you script a wrapper.

## Contact sheet for founder review

Downscale with the server's own sharp (`server/node_modules/sharp`, import via
`pathToFileURL`) to ~520px JPEG q72, embed as data URIs (Artifact CSP blocks
remote images), one row per skill: input | takes | reference images. Publish
via the Artifact tool. A 4×6-cell sheet lands ~700KB. Reference builder:
this pattern was first used for `ad-creative-r1` (2026-07-12).

## Anti-patterns (the "30 minutes per image" causes)

- Driving the canvas UI (click Generate, poll the board) for batch work — the
  hidden Browser pane freezes rAF-driven UI states and every run costs
  minutes of navigation. UI runs are for verifying UX, not producing images.
- Running cases sequentially in one foreground shell.
- Letting the studio's `pro` preset leak into draft batches (see `--preset`).
- Regenerating the Director prompt per image — one Director call per run
  yields N take prompts; renders reuse them.
- Waiting on generation through `/api/run` + credit gate when the headless
  harness gives the identical production lens path without metering.
