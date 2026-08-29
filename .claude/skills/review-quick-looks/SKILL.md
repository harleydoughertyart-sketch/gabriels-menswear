---
name: review-quick-looks
description: Use when verifying that Quick Looks actually work — rendering a batch of Looks against several input photographs and building the before/after review sheet the founder reads. Use when asked to check, test, verify or prove a Look, to show before and afters, to build a review sheet or contact sheet for Looks, or after authoring a round in any industry (Jewelry, Beauty, E-commerce, Art, Spaces, Fashion).
---

# Reviewing Quick Looks

Prove a batch of Looks works, and hand the founder one HTML file he can judge in
under a minute. Sibling to [`author-quick-looks`](../author-quick-looks/SKILL.md),
which WRITES the prompts; this one VERIFIES them. Read that skill when the answer
to a bad row is a rewrite.

**The whole thing is one command.** Do not re-derive the HTML by hand.

```bash
npm run looks:review -- --looks J002,J003,J004 \
  --inputs-dir "D:/runninghub-test-app/_local/jewelry-inputs" \
  --name jewelry-r1
```

That renders 3 Looks × 3 inputs, measures what can be measured, and writes
`D:\Luvley Looks Library\reviews\jewelry-r1.html`. Add `--list` to see the plan
and the cost without spending anything, and `--sheet-only` to rebuild the page
from a round already on disk.

---

## The bar: a fast, confident human judgement

He read a full sheet and gave a verdict on every Look **in seconds**, once he
could actually see them. That is what the sheet is for.

**Anything that does not serve that is a cost, not a feature** — a clever metric,
a compact layout, a detail crop, an acronym, an extra panel. Thoroughness is not
the goal and has twice made the sheet worse. Measure whatever you like inside the
script; show only what a verdict is made of.

## The test unit is ONE Look × THREE inputs, judged for COHESION

> "I wanna see if a bunch of different input images — two or three — that are all
> slightly different, running with the same look, can give me a cohesive end
> result. That's what the look is designed to do."

One row per Look. One cell per input. **A Look that succeeds on one input and
fails on another has FAILED**, however good the best image is, and the sheet says
so — `failsOn` in `verdicts.json` forces the row to FAILED whatever verdict word
sits beside it.

This is the single most important line here. An earlier round got it backwards
and rendered **ten Looks against two inputs**, which cannot answer the question at
all. The script now refuses a single-input round outright, and a row with one
render reads `CANNOT JUDGE` — never `PASS`. Silence is not a pass.

## The layout is settled. Eight corrections bought it; do not re-litigate it.

| Rule | His words | Why an agent breaks it |
| --- | --- | --- |
| **Before beside after, at the same display size**, in every cell | *"I can't see the small photo, the real starting image… I want the real photo next to the generated one, so I can see them. They should be, like, the same size."* | The judgement is a COMPARISON and the eye cannot make one across a size difference. A small input thumbnail beside a big output is the failure. So is showing the input once at the top of the row. |
| **Big whole images.** Never shrink to fit | *"All the images are too small for me to be able to actually look at the detail. I can't see the before and afters in a good enough way to be able to test them."* | Size the images to the **defect being judged** — skin texture needs far more width than composition. `--pair-width` raises it. Vertical page length is free; spend that, never the picture. |
| **ONE page scrollbar. The sheet never has an inner scroll region** | *"I don't like having to scroll with the bar to see the different variations… I should just be able to scroll down the web page and see the before and afters in, like, two columns or whatever all the way down. I don't like this having to scroll to the — with a sub scroll bar to the right to see them."* | Inputs stack **down** the page; each is two equal columns, before beside after. Nothing may create a second scrollbar — not `overflow:auto`, and **not `overflow:hidden` either**, because a clipped strip that silently cuts off take 3 is worse than the scrollbar he complained about. The mechanism is the rule: images are sized by **width**, so a row is a share of the page by construction. **Height-driven sizing is what forced the sub-scrollbar** (a row ran ~4300px wide); never bring it back. |
| **NO detail crops.** Tried, rejected | *"I don't know what this hundred percent zoom is. Are you cropping the zoom in for me? Don't do that. It's weird. It's wasting time. I'd rather just see the results of the actual generation."* | An agent optimising for rigour reintroduces this. It has already been thrown out by the person the sheet is for. Compute the detail, print the **number**, never show the crop. |
| **No jargon, no acronyms, no unexplained numbers** | *"So what is this HFE thing? I don't really know what that means."* | Every number carries a plain-English label and a direction — what it measures, whether higher or lower is better. **A measurement the reader cannot interpret is worse than none**: it takes space and reads as evasion. If it needs more than one short clause, cut it. |
| **The change must be visible without reading.** Colour the diff | *"This is a lot closer to what I was looking for for the layout. Just make the difference a different colour so I can actually see it. I think that's important for scannability going forward."* | He is reading many rows fast, so the delta has to jump out — unchanged text greyed back, only the change coloured. **Colour is the accelerator, never the information**: removals are also struck through and every change carries a `+` or `−`, which is what survives a colourblind reader and a black-and-white print. An agent that drops the signs because "the colour already says it" removes the half that survives. |

The last two are one instruction, not two: **big whole images, never cropped
fragments.** An agent that reads "no crops" alone shrinks the images to fit more
on screen — which is the very next thing he rejected.

## Small batches. Never mass-generate.

> "I don't want you just mass generating shit."

Default ceiling is **6 Looks**; past that the script refuses until someone types
`--wide`. Render a handful, get his read, and only scale once a pattern is
proven. `--wide` exists so going wide is a decision somebody made, not a default
nobody noticed.

## Cost discipline

~$0.10 a render. 3 Looks × 3 inputs = 9 renders ≈ $0.90. A full 34-Look × 3-input
pass is ~102 renders ≈ **$10**.

The plan and the dollars print **before** the first render, and past 12 *new*
renders the run stops and asks — `--yes` past it, and in a non-interactive shell
it refuses rather than guessing. Resumed pairs are free and do not re-trigger the
question.

**Always pass `--preset` explicitly.** It defaults to `nb2` and prints what it
used. Omitting a preset elsewhere inherits the studio's setting, often `pro`,
which silently triples render time. **Never point anything at `https://luvley.ai`**
— the script runs `runGeminiProvider` in-process: no auth, no HTTP, no credits,
no Firestore.

---

## The loop

### 1. Pick the Looks and the inputs

```bash
npm run looks:review -- --looks J002,J003 --inputs-dir "<dir>" --name jewelry-r1 --list
```

`--list` prints the plan, the cost and the resolved prompts, then exits **before
importing the provider** — it needs no API key and cannot spend. Run it first,
every time.

- **Look ids** resolve against the shipped catalogue
  (`server/builtin-starter-catalog.json`) by full id, short tag (`Q025`) or
  suffix. `--print-ids` lists everything. Pass `--catalog _local/<industry>-catalog.json`
  to review a draft instead of what shipped.
- **Inputs must be able to fail.** Span photo *quality* (a good shot, a busy
  scene, a bad low-light snap) and subject *kind*. Three inputs that are all the
  same kind of photograph prove nothing — the cohesion question is precisely
  whether the Look survives their differences. `--inputs-dir` takes the first
  three images; `--inputs a.jpg,b.jpg,c.jpg` names them exactly.

### 2. Render

Drop `--list`. Renders land in `<Looks Library>/reviews/_rounds/<name>/`, beside
the sheet and **outside the repo** — a crewmate worktree being swept cannot take
the round with it, and the next agent resumes rather than re-buying. A pair whose
PNG already exists is skipped.

### 3. Read the sheet yourself, first, and grade honestly

**He looks at these himself. A sheet that praises an image he can see is wrong
destroys trust in every other row.** Never grade generously; a FAILED row costs
one rewrite, a falsely passed row costs the catalogue's credibility.

The script computes a band from the numbers — the **worst** metric decides, never
the average, because averaging is how a row that is broken on one axis comes out
"fine". Then write your own read into the `verdicts.json` the script drops in the
round directory:

```jsonc
{ "quickblock-adlook-j002": {
    "verdict": "fail",
    "failsOn": ["b-boxed-tiny"],
    "note": "the ring gains a fourth prong on the boxed input" } }
```

Re-run with `--sheet-only` to fold it in — free, no renders. The computed band
stays visible beside your verdict, so a generous grade shows up as a
**disagreement** rather than hiding as a replacement.

### 4. Hand it over

Give him the **local path**. `D:\Luvley Looks Library\reviews\<name>.html`, opened
by double-clicking; `INDEX.html` in that folder lists every round.

**An Artifact may be published in addition, never instead.** Handing back only an
Artifact URL was one of those corrections. The file is self-contained — images
inlined as data URIs, no CDN, no external font, every style inline — so it
survives being moved or attached, and it opens straight off disk.

**It declares `<meta charset="utf-8">`, and that is not decoration.** Opened from
disk there is no server header to go on, so a browser falls back to windows-1252
and every em dash and curly quote in the prompts turns to mojibake — one Sets
sheet carried **78** of them, including a Look name. Garbled punctuation reads as
sloppiness in a document he is being asked to trust. Any new page written by this
workflow declares it too.

### 5. Rewrite only what failed

Back to [`author-quick-looks`](../author-quick-looks/SKILL.md): fix **the prompt
that failed, on the evidence of the render that failed**, change one thing per
round, and never backport a fix by similarity to prompts nobody marked.

---

## Prove which prompt each render actually used

**A stale prompt store silently serving old text has already cost this project a
session, and it makes a null result indistinguishable from a plumbing fault** —
the Look looks broken, the prompt on screen looks right, and the two were never
the same string.

So the exact outbound text is written to `<stem>.txt` **before** the render, and
`<stem>.json` records its sha256 plus the catalogue file and hash it came from.
At sheet time the sidecar is re-checked against the catalogue as it stands now,
and every row prints one of three things:

- *matches the catalogue byte for byte* — trustworthy;
- **the catalogue has CHANGED since this render** — you are looking at images made
  from older text, in red;
- *no sidecar on disk* — it cannot be proven what produced this, which is not the
  same as fine.

If a whole round comes back null, check that line **before** rewriting anything.

## Under every row: the full prompt, and what changed

> "I want the prompt used to generate them with a difference at the bottom — just
> easier for me to debug visually."

The full prompt as sent, verbatim, plus a word-level comparison against a
baseline. **The comparison is coloured, because he could not see it otherwise:**

> "Just make the difference a different colour so I can actually see it. I think
> that's important for scannability going forward."

Four rules hold that up, and all four are in
[`quick-looks-review-core.mjs`](../../../scripts/lib/quick-looks-review-core.mjs)
under unit test — do not re-type a copy of them into the generator:

- **Everything unchanged is greyed back**, and only the change is coloured. Added
  words are blue with a `+`; removed words are red, struck through, with a `−`.
  Blue rather than the green of a code diff because this page already spends
  green on PASS and red on FAILED chips, and a green highlight beside a green
  chip reads as a verdict.
- **Colour is the accelerator, never the information.** The strike and the signs
  carry the meaning on their own, so the block still reads for a colourblind
  reader and on a black-and-white print. Both were checked on a real sheet.
- **Adjacent changes are gathered into whole phrases.** A word-level comparison of
  two prompts that share only their small words alternates every other word —
  `−Create +A −a +cathedral` — which is a correct comparison and an unreadable
  one; colouring it only makes the stripes brighter. A stretch never crosses a
  line break, so paragraph shape survives.
- **The row header carries three word counts** — added, removed, unchanged. That
  is what separates *33 added, 189 unchanged* from *195 added, 210 removed, 8
  unchanged* at a glance: a tweak and a rewrite look the same shade of blue.
  Verdicts are numbers, not adjectives, and this is the same rule.

Three baselines, in order:

1. **the previous revision** — the most recent earlier round that actually ran
   this Look, found automatically;
2. **the predecessor Look**, for a rewrite under a new id — `--vs NEW=round:OLD`.
   An A/B variant is a new id no earlier round has heard of, so without this the
   row he most wants to read is the empty one;
3. **neither** — the row says **FIRST APPEARANCE** out loud and diffs against the
   batch's shared clause scaffold: a declared `clause` if the catalogue carries
   one, otherwise the text every prompt in the batch already shares, so the
   highlight is what this Look adds on top of the house boilerplate.

**A silently absent diff is a defect.** When even the scaffold is empty the row
says *NO BASELINE AT ALL* rather than showing nothing.

## Verdicts are numbers, not adjectives

Wherever a ground truth exists, the sheet prints the measurement and the
threshold, so the reader can disagree with the number rather than with a word.
Four are computed for every image, before and after side by side:

| shown as | is | direction |
| --- | --- | --- |
| colour behind the subject | mean of the four corner patches | falsifies a "seamless white" claim outright |
| how even that colour is | how far those four corners differ from each other | lower is more even; 0 is perfectly flat |
| how much of the frame the subject fills | share of the picture that is not that background colour | higher is a tighter shot |
| overall brightness | 0 black to 255 white | — |

Cohesion is the **spread** of those across the row, plus frame shape. Anything a
number cannot decide — is the stone right, did it invent a prong, is the hand
real — is a picture for a human, and is labelled as such rather than dressed up as
a measurement.

---

## Where the pieces are

| | |
| --- | --- |
| the verb | `npm run looks:review` → [`scripts/quick-looks-review.mjs`](../../../scripts/quick-looks-review.mjs) |
| the rules, pure and tested | [`scripts/lib/quick-looks-review-core.mjs`](../../../scripts/lib/quick-looks-review-core.mjs) |
| its tests | `node --test server/scripts/test-quick-looks-review-core.mjs` (in the server `test:skills` suite) |
| sheets | `D:\Luvley Looks Library\reviews\<name>.html`, index at `INDEX.html` |
| renders | `D:\Luvley Looks Library\reviews\_rounds\<name>\` |

`LOOKS_LIBRARY_DIR` moves the library. The script must stay **inside the repo** or
Node cannot resolve `sharp` and `@google/genai`, and `.env` must load **before**
the dynamic provider import because the Gemini client reads the key at module
load — both are already handled; do not reorder them.

**Not to be confused with `scripts/quick-looks-sheet.mjs`**, which belongs to the
authoring loop. That one reads a round somebody else rendered and gives each row
the inputs its own `expects` selected — right when refining one prompt, wrong
here, because columns that differ per row cannot be compared down the sheet. This
one pins ONE input set across every row, which is what makes cohesion legible.
