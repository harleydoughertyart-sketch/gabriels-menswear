---
name: author-quick-looks
description: Use when building or expanding a Quick Looks catalogue for an industry — Jewelry, Beauty, E-commerce, Art, Spaces, or more Fashion. Use when writing or rewriting a Look prompt, running a render round, reading a round's contact sheet, rendering the tile for a Look, or publishing approved Looks into the app.
---

# Authoring Quick Looks

Take one industry from *"let's do Jewelry next"* to Looks a signed-in user can
click. You operate a loop; you are not writing a document.

**Read [`docs/quick-looks-authoring.md`](../../../docs/quick-looks-authoring.md)
before you touch anything.** Required, not background: 17 sections, each paid for by
a failed round of the Fashion pilot (95 catalogue records, ~20 rounds, several
hundred renders, 89 shipped Looks). This skill is its operative form — re-derive
nothing, duplicate nothing.

| Before you… | Read |
| --- | --- |
| write or rewrite any prompt | §3 direction never negation, §6 geometry not adjectives, §7 strongest instruction first, §4 the verb decides the mode (corollary: the winner was the shortest) |
| write Style / Sets / Casting | §8 every axis holds the others fixed, §9 compose a board not panels, §10 props need a source, §5.2 some rooms are empty by nature, §11 one true imperfect feature |
| render a TILE | §5 entire — 5.1 one-point perspective is THE tell, 5.3 "dark" does not produce dark, 5.4 a lighting base arrives unlit, 5.5 flat artwork cannot show light, **5.6 not every Look has a before**, **5.7 tile inputs are chosen, never taken** |
| test anything, or ship | §12 the RESCUE test and `expects`; §13 process traps; §15 where a Look lands; §17 retired ids cannot be re-imported |

---

## The chain

```
catalogue JSON -> render round -> contact sheet -> founder verdict
      ^                                                  |
      +-------- rewrite ONLY what failed <---------------+
      |
      v
 tile renders -> manifest -> import --publish -> npm run bake:looks -> commit
                                                                         |
                                                                         v
                                    owner presses "Publish catalog from git"
```

**Publishing without baking ships nothing.** `--publish` writes
`.data/starter-catalog.json`, which is **gitignored**; `npm run bake:looks` copies it
into the tracked artifact `server/builtin-starter-catalog.json`. A whole cycle was
lost here — the import reported success, the local app showed the Looks, nothing had
shipped. The owner pressing *Publish catalog from git* in production is a third,
separate action ([`.claude/commands/looks.md`](../../commands/looks.md)).

**To VERIFY Looks rather than author them, use
[`review-quick-looks`](../review-quick-looks/SKILL.md)** — `npm run looks:review`.
It renders a small batch against ONE pinned input set, judges each Look for
cohesion across those inputs, and writes the before/after sheet the founder reads
at `D:\Luvley Looks Library\reviews\`. Different verb, different time: this skill
answers *what should the prompt say*, that one answers *does this Look actually
work*. Its layout is settled and its rules are his, so do not hand-roll a review
page here.

One script per link: `scripts/quick-looks-{inputs,render,sheet,cards,manifest}.mjs`
plus `scripts/import-ad-look-blocks.mjs`. Shared helpers sit in
`scripts/lib/quick-looks-core.mjs`, pinned by
`server/scripts/test-quick-looks-core.mjs` (`node --test`, not vitest, in the server
`test:skills` suite). Extend that test; never weaken it.

---

## The author's prohibitions

The most expensive lesson in the Fashion build is one an author repeats by instinct:
a render comes back wrong, so you forbid the wrong answer. It does not work. **A
stack of prohibitions is answered by holding the subject rigid against the reference
photograph** — the exact failure the prohibitions were added to prevent. Three fixes
in a row each caused the next failure.

The rule is recursive, and this section is its outer loop: **an agent that reads this
skill and then writes a "never…" clause into a Look prompt has failed the skill.**
Length is not the variable — removing ~700 characters of negation got a pair of shoes
onto the floor; adding ~600 characters of *direction* got the camera down there.

### In a prompt — give the model a job, in actions

| Never write | Write instead |
| --- | --- |
| a prohibition — *"never add a mark"*, *"no surface or colour remains"*, *"do not stiffen"* | the action you want: *"place the subject where it would really sit in this space, at its true size relative to the room"*, *"fabric still creases and hangs under its own weight"* |
| an adjective for a shape — *"a believable worn three-dimensional shape"* | the **geometry** in frame: *"the shoulders are squared and hold their shape, the sleeves are rounded and full of air and stand away from the body, the neck opening is open and circular with shadow down inside the collar"* |
| the replace instruction buried mid-paragraph | it as the **opening words**: *"Completely replace the person in this photograph with a different person, described below. This is a full replacement, not an adjustment."* |
| a variations prompt naming only what to develop | what it **holds fixed** on the other two axes — cut/silhouette varies while fabric, colour *and any print on it* hold; print varies while cut, sleeve and proportion hold |
| N discrete panels or items held consistent — a six-panel PDP sheet, a merchandising table | **one composed board**: a designed layout with deliberate overlap, alignment and whitespace |
| a composition rule for props — *"a few supporting elements chosen for colour and material"* | where to **get** them: *"read what the product itself tells you — its material, its era, its subculture, the kind of person who owns it — and choose objects that genuinely belong to that world"* |
| a flawless casting | **one true imperfect feature** a composite would not invent: a gap between the front teeth, a nose broken once and healed crooked, a scar through an eyebrow, vitiligo |
| a **relative** size word — *"oversized"*, *"small"*, *"a few centimetres across"* | the size of a **named everyday object**: *"the bloom as wide across as the palm of a hand"*, *"each as wide across as the base of a drinking glass"*, *"the largest piece a good handful"* |
| a clause that **fights its own instruction** — *"This is a macro photograph… and the camera is close enough that the piece is the largest thing in the picture"* | the instruction alone. Say macro, then stop. The second half commanded the subject to dominate, which is the opposite of macro, and cutting it is what finally made scale work |

The one earned exception: two explicit negations at the *end* of the Ghost Mannequin
rewrite (*"it is not lying flat, and it is not viewed from above"*), because they name
the specific wrong answer the model had already given. That is the bar — a negation
earns its place only against a render you are holding.

### In the process

| Never do | Do instead |
| --- | --- |
| backport a fix by similarity across prompts | fix **the prompt that failed, on the evidence of the render that failed**, and leave the rest alone. A text heuristic cannot tell "similar" from "superficially similar": matching *environment* flagged 51 of 59 prompts, because it read a **negation as a match** — and would have told fifteen working prompts to change a background they exist to preserve |
| change two things in one round | change **one**, and prove it with the sheet's yellow diff (step 5). Several rounds were burned stacking edits nobody could later attribute |
| believe a defect before checking the rig that produced it | verify the input first when it is generated rather than photographed |
| fix a "failure" you have not diagnosed | diagnose it. Small printed text is a **legibility threshold**, not instruction-following: in one render large type reproduced perfectly while a 70px chest patch was confabulated. No wording fixes that; scope the promise by slot instead |
| batch ten rounds and then ask the founder | bring him **one round at a time**, terse, with your own read attached. He is taste; you are QA |
| leave a round's output only in `_local/` as a worktree agent | write deliverables outside the worktree, or commit them — a background agent with `isolation: "worktree"` and no committed changes is swept, and takes the round with it |

Steps 2 and 6 check both tables explicitly. Nothing else here is worth running if
these are skipped.

---

## 0. Make the catalogue carry its own clause

A catalogue is a bare JSON array or `{ "clause": "...", "looks": [...] }`. The clause
is a shared trailing sentence appended to every prompt — for Fashion, the
applied-marks fidelity clause that stopped a customer's own brand name being rewritten
onto their own garment (*"Eight&9 Racing"* came back *"Endless Racing"* in round 1).

**`_local/fashion-catalog.json` is still a bare array**, so its clause survives only
inside the retired `_local/fashion-test.mjs`. Run it through the tracked renderer
as-is and every prompt renders **without** the clause — silently, no warning.
Converting it to object form is a one-time data edit and is step 0 of any Fashion
re-run. Per-record `skipClause: true` opts one prompt out; use it rarely, since the
clause changed *which* brand name got invented rather than stopping invention.

Also stranded from `_local`: **the model relights a scene willingly but will not
degrade one on purpose.** Every working "bad photo" ask is phrased as what is
physically in the frame and how it is lit — never as a camera setting or a quality
instruction.

## 1. Draft the catalogue

Two kinds of record. **Complete** — a whole shot, subject/set/light together, run
**alone**; never call one a "template", they are finished directions and the word
undersells them. **Pieces** — modular, stacked freely, so Casting + Set = that person
in that place. The five piece slots are already modelled in
[`client/src/quickLooksTaxonomy.ts`](../../../client/src/quickLooksTaxonomy.ts):
Casting (`subject`), Sets (`scene`), Looks, Lighting, Camera. **A new industry adds
catalogue rows, not code.**

**How many.** Casting carries the volume and the range — Fashion used 28, spanning 20s
to 60s, ten-plus ethnicities, bleached buzz to locs to a silver crop, petite to curve
to broad. Complete, Sets and Looks are industry-scoped and mid-sized. Lighting and
Camera are mostly free: 25 shared Looks already compose with every industry.

Every piece is **ambiguous on intake** (*"the subject from the reference photograph"*,
never a product noun, so one Set works on a dress, a sneaker, a perfume bottle or a
mouse), **hyper-specific on what it adds**, and **migrates the subject fully, with no
bleed**. Ambiguity is scoped by slot; over-ambiguity and over-narrowing are both bugs:

| tier | slots | vocabulary | reaches |
| --- | --- | --- | --- |
| fully ambiguous | Lighting, Camera | never names the subject | every industry — only the before/after changes |
| industry-scoped | Casting, Sets, Looks, Complete | *the garment*, *the wearer* | that industry |
| **too narrow — a bug** | — | *the dress*, *the top* | fails on a scarf, a bag, a shoe |

One file, `_local/<industry>-catalog.json`:

```jsonc
{
  "id": "J07", "name": "…", "group": "Sets", "result": "…", "prompt": "…",
  "expects": ["ring", "necklace"],      // kinds accepted; drives selection + the tile pair
  "testInputs": ["X1-hoodie", "F105"],  // optional PIN: exact photographs, not a sample
  "skipClause": false,                  // optional opt-out of the shared clause
  "verdict": "approved",                // cut | cut-proposed | variant are dropped at manifest time
  "coverRound": "covers", "coverInput": "F111"   // optional founder pick for the tile
}
```

Prompts live in data so a rewrite is a **data edit, never a code edit** — that is what
makes the loop cheap enough to run twenty times.

## 2. Write the prompts

Apply the *In a prompt* table to every record. It is not background reading; it is the
step. **Done when** you can name, for each prompt you changed, the row it violated —
and every prompt has been read against all seven rows, not just the ones you doubted.

## 3. Declare `expects`, and build inputs that can fail

`expects` does three jobs: feeds the right photographs to the right prompt (an
accessory Look judged on a dress is mis-fed, not broken — two of five apparent failures
in one round were this), tailors the shipped before/after pair to the Look, and lets
the app say *"works best with: a bag, shoe or belt photo"* instead of letting a user
find out by burning a generation.

```bash
node scripts/quick-looks-inputs.mjs --industry jewelry
node scripts/quick-looks-inputs.mjs --industry beauty --source "D:/dir" --prefix bt
```

It copies that industry's befores into `_local/<industry>-inputs/library/`, montages
them so 25 candidates are judged in one look, and seeds
`_local/<industry>-library.json` with every id under `unsorted`. **The typing is
yours** — move each id into a kind bucket by hand. Those bucket names are the strings
`expects` selects on, and the renderer refuses to run while `unsorted` is non-empty.

Inputs must be able to **fail**. Fashion round 1 used a linen tunic on a seamless
backdrop and proved nothing — no branding, no graphic, no hardware. Span two axes:
photo **quality** (decent shot, busy scene, bad low-light snap) and subject **kind**.
**The over-narrowing probe is the input that is NOT the obvious subject** — every photo
passes a prompt that says *"the dress"*; only a shoe or a bag catches it. Hand-picked
photographs for pins and stress rounds go in `_local/<industry>-inputs/stress/`. Art
and Spaces have no research folder and need a founder-supplied set via `--source`.

## 4. Run the round — one variable per round

```bash
node scripts/quick-looks-render.mjs --industry jewelry --round r1 --list   # plan only
node scripts/quick-looks-render.mjs --industry jewelry --round r1
node scripts/quick-looks-render.mjs --industry jewelry --round r2 --prompts J02,J07 --rolls 2
node scripts/quick-looks-render.mjs --industry jewelry --round s7 --prompts J07 --stress
node scripts/quick-looks-render.mjs --industry jewelry --round covers --pairs
```

`--industry` is required. Then `--round` (default `r1`), `--prompts ID,ID` (dies naming
any id with no record), `--rolls N`, `--pairs`, `--stress`, `--concurrency N`
(default 6), `--per-prompt N` (default 3), `--aspect` (4:5), `--preset` (klein),
`--resolution` (Medium), and path overrides `--catalog`, `--library`, `--inputs`,
`--stress-dir`, `--out`.

- **`--rolls N`** renders a prompt N times (`<id>__<key>__rN.png`). **One roll cannot
  distinguish a prompt change from a seed.** Roll 0 takes no suffix, so `--rolls 1`
  stays byte-compatible with older rounds.
- **`--pairs`** keeps only the first chosen input — one render per Look, for covers.
  Applied after selection, so it works on pinned, sampled and stress rows alike.
- **`--stress`** runs every case against every photograph in the stress pool,
  overriding **both** `expects` and `testInputs`. Stress-testing for consistency comes
  *after* refinement, never before.
- **`testInputs`** pins exact photographs and is deliberately **not** bounded by
  `--per-prompt` — a pin is a decision, not a sample size. Keys resolve stress pool
  first, then bare library id, and land verbatim in the filename, which is the contract
  the manifest reads back.

**Run `--list` first, every time.** It prints the prompt × input plan and names any
record whose `expects` asks for a kind the library does not stock — those render
nothing and look identical on a sheet to a Look nobody asked for. It exits before
importing the provider, so it needs no API key and cannot spend money. Keep it so.

In-process: it imports `runGeminiProvider` directly — no auth, no credits, no HTTP, no
Firestore. **Never point it at an origin.** Resumable: an existing PNG is skipped, so a
rate-limited run is re-run, not restarted. **Every render writes the exact prompt sent
to `<stem>.txt` beside its PNG**, before the render, so a run that dies mid-flight
still leaves the prompt that was in play. Without those sidecars there is no step 5.

**Sizing.** ~45s per render, ~$0.05 each at klein/Medium, **18 concurrent proven
safe**; the ceiling is provider concurrency, not orchestration, so run whole rounds in
parallel rather than widening one. Multiply prompts × inputs × rolls before you start
and say the number and the cost out loud. **Done when** `results.json` shows every
planned render either `ok` or named with its error.

## 5. Read the sheet yourself, first

```bash
node scripts/quick-looks-sheet.mjs --industry jewelry --round r6 --vs r5
node scripts/quick-looks-sheet.mjs --industry fashion --round s6 --vs FS10-B=s6:FS10 \
  --clause-marker "Reproduce every printed or"
```

One row per prompt; columns are **that prompt's own inputs**, never a shared column set
(a shared set turns a legitimately accessory-only Look into a row of "not run" holes
that reads as broken work). Cells come from real filenames, so every roll gets a cell.
Self-contained data-URI HTML, so it renders anywhere including under the Artifact CSP.

**The yellow diff is the point.** Per row the sheet shows what changed in the prompt
since the last round that ran it — `<ins>` yellow, `<del>` struck, adjacent runs merged
so one edit is one highlight. It reads the `.txt` sidecar the renderer wrote, never the
catalogue, because the catalogue is the live prompt and has already moved on. The
automatic baseline is the most recent **earlier round that actually ran that prompt**,
by run order (mtime), not lexical order. Three forms of `--vs`:

1. `--vs r5` — one baseline round for every row.
2. `--vs FS10=r5` — a baseline for one prompt.
3. `--vs FS10-B=s6:FS10` — diff against a **different prompt in the same round**.
   **An A/B variant is a new id, so no earlier round has heard of it, and the row the
   founder most wants to read is the row with nothing in it.** This is how you read an
   A/B pair one added sentence apart — the yellow block *is* the experiment.

Two failure modes to recognise rather than debug. **No diff at all** means the round
has no `.txt` sidecars (it predates them, or was produced another way); the sheet warns
on stderr. **The whole clause highlighted** means the clause was not stripped — pass
`--clause-marker "<first few words>"` when the round ran under a clause the catalogue
no longer carries, e.g. Fashion's `--clause-marker "Reproduce every printed or"` until
step 0 is done. Matching the *opening* words is deliberate: Fashion's clause gained a
sentence mid-build and a whole-string match would have failed on one side. Other flags:
`--dir` (its parent is the round root for the baseline search), `--inputs`,
`--stress-dir` (defaults to the `stress` sibling of `--inputs`, matching the renderer —
override one and you must override the other), `--catalog`, `--out`.

**You read the sheet before the founder does, and you say what you see** — the rows
that fail, the mode of failure, what you would change and why. A sheet handed over
without a read is QA delegated upward. Judge by the **rescue** test: *does this prompt
drag a bad photograph up to the same professional result it gets from a good one?*
Never by consistency.

**When what he wants is a before/after verification sheet rather than a refine
round, stop here and use [`review-quick-looks`](../review-quick-looks/SKILL.md).**
Its layout is settled by six of his own corrections — before beside after at the
same size, big whole images, no detail crops, no jargon — and rebuilding one by
hand re-earns every one of them.

## 6. Founder verdicts, rewrite only what failed, then lock

One round at a time, terse. He marks a verdict per row. Rewrite **only** those,
applying the *In a prompt* table, and re-render **only** those (`--prompts`, same round
directory — it resumes). To test a wording, ship it as an A/B variant in the **same**
round under a new id, one sentence apart, and read it with `--vs <new>=<round>:<base>`.
**Done when** no prompt he did not mark has changed, and no edit is a rule propagated
from a different prompt's failure.

Then mark the approved record LOCKED so nobody adds a clause to it later — a working
prompt is what this process is for, and the next round's instinct to "improve" it is
what breaks it. Set `verdict` on anything cut.

## 7. Tiles — two paths, not interchangeable

**Transformational Looks** (Complete, Studio, Style — anything that changes a customer
photograph) get their tile from a refine round, `--pairs`. Tile inputs are **chosen,
never taken** (§5.7): a cover run that walked every Look through first-input selection
produced 76 of 80 tiles on the same denim jacket. Pin with `testInputs` or
`coverRound` + `coverInput`, and check the spread histogram in step 8.

**Choice Looks** (Casting, Sets, Lighting, Camera) have no "before" — you are picking a
person, a room or a light, and there is nothing any of them was beforehand. They ship
**single-image**, and an agent that does not know this walks the castings through the
render harness and produces 34 identical models.

```bash
node scripts/quick-looks-cards.mjs --industry fashion --group casting --list
node scripts/quick-looks-cards.mjs --industry fashion --group sets --only S02,S03
node scripts/quick-looks-cards.mjs --industry fashion --group base --round m1
node scripts/quick-looks-cards.mjs --industry fashion --group light --base <picked>.png
```

- **Groups are `casting` / `sets` / `light` / `base`**; `--group` also accepts the
  catalogue strings (`Models`, `Sets`, `Lighting`, `Camera & FX`). Naming either
  *Lighting* or *Camera & FX* gets **both** — one card kind, one shared base.
- **Lighting/Camera is two commands.** Render base candidates (`--group base`), a
  **human** picks one, then `--group light --base <pick>.png`. No auto-pick, and there
  should not be one: three founder review rounds went into that single decision. The
  script prints the follow-up command.
- **`--list` is a real go/no-go.** It prints the plan, existence-checks the base, and
  prints the first fully assembled prompt, then exits without importing the provider.
  The assembly *is* the experiment; a dry run that hides the sent text shows nothing.
- Lighting/Camera prompts run **verbatim** — no clause, no rewriting. If a Look cannot
  light the base on its own text, that is a finding about the Look.
- Casting cards share **one house outfit spec**, written per gender presentation, or the
  wall reads as 38 unrelated photographs. The provider safety ceiling is a limit on the
  **request**, not a wording puzzle: a bandeau/shorts/shirtless attempt was rejected on
  all eight renders with `safety_violations=[sexual]`, and body-focused phrasing tipped
  the classifier on otherwise identical scene text. Appeal photographically — side key,
  weight on one leg, chest-height camera.
- Same economics as a refine round; resumable, concurrent, writes `<id>.txt` first. Also
  `--prompts` (same as `--only`, and it wins), `--round`, `--catalog`, `--out`, `--base`,
  `--concurrency`, `--aspect`, `--preset`, `--resolution`.
- **To add a group: one entry in `CARD_GROUPS`** — `groups`, `defaultRound`,
  `concurrency`, `describe` (the seam in the shipped prompt), `describeFail`,
  `assemble`, and `canvas` or `file` + `fileHint`. `records` is the only optional key:
  supply it and the group stops reading the catalogue, as `base` does. The two easy to
  miss are `defaultRound` and `concurrency`, because nothing defaults them — leave
  `defaultRound` out and the run dies in `path.join` before the plan prints, leave
  `concurrency` out and the positive-number guard blames a `--concurrency` nobody
  passed. Never a branch below the table.

## 8. Build the manifest

```bash
node scripts/quick-looks-manifest.mjs --industry jewelry --dry-run
```

Flags: `--industry` (required; prefixes every row id), `--label <Industry>` (the
manifest's `industry`, inferred where it can be), `--catalog`, `--tests`, `--inputs`
(the inputs **root**, not `library/`), `--out`, `--aspect`, `--drop-verdicts` (default
`cut,cut-proposed,variant`), `--exclude-rounds` (default `covers`), `--dry-run`.

Every hash is computed from bytes read off disk at emit time — never copied forward from
the catalogue, a `results.json` or a previous manifest, because a copied hash proves
only that two files agree about a number. Cover selection: founder pick wins, else the
newest round that ran the Look, else within that round the input **least used across the
library so far**. An unbuildable Look is skipped with a reason and named at the end; one
never costs the other 88.

Read three things before going on. **The input-spread histogram**, worst-first — healthy
looks like Fashion's `F101 ×5, F102 ×5, F111 ×5` across 11 photographs, and one
photograph towering over the rest is §5.7 happening again. **The prompt-drift warning**,
the chosen render's `.txt` against the text being shipped: it fires on 26 of Fashion's
89 Looks today and the drift is real, so **render the final pair AFTER the last prompt
edit** — the one thing the newest-round rule cannot catch. **The skip list.**

Groups map to sections through `PILOT_GROUPS` (Fashion's defaults); an object-form
catalogue overrides or extends it with a `groups` block of `{section, people?, cards?,
before?}`. **A group with no entry is skipped, never guessed.** `single` is derived, not
declared: a Look is single-image exactly when nothing can be its before. **After any
edit to this script**, emit the manifest and confirm `import-ad-look-blocks.mjs
--dry-run` still accepts it with the same Look and section counts — the only cheap
regression test it has.

## 9. Import, publish, bake, ship

```bash
node scripts/import-ad-look-blocks.mjs --manifest=_local/jewelry-manifest.json --dry-run
node scripts/import-ad-look-blocks.mjs --manifest=_local/jewelry-manifest.json --publish
npm run bake:looks
node --test server/scripts/test-bake-starter-catalog.mjs
```

Draft -> published -> baked, as in *The chain*. `.data/prompt-blocks-storage.json` is a
**derived mirror — never write it**: it is rewritten from the published catalogue on the
first catalogue read of every boot, so a block edited into it survives exactly until the
next restart. **Author in a manifest and import headlessly; never in the app.**

Manifest schema: `{generatedFrom, count, breakdown:{industries:{<label>:n}}, looks:[{id,
name, prompt, promptSha256, industry, section, people, targetAspect, tags,
before?:{absolutePath,sha256}, after:{absolutePath,sha256}}]}`. The importer re-hashes
everything and aborts before writing a byte on any disagreement, so the manifest is the
immutability gate, not a convenience. Four things bite, all quiet:

- **`before` is optional, and its absence IS the single-image contract** — omitting it is
  what drops `previewBeforeUrl`. Declaring a `before` that cannot be produced is a hard
  failure, and a re-import carrying one the manifest does not declare fails reconciliation.
- **`section` is what puts a Look in its slot**, matched against `SLOT_BY_SUBSECTION_TAG`
  by exact string and industry-prefixed because that map is shared. A string that is not
  a key there lands the Look in `looks` with no error at all.
- **`INDUSTRY_SECTIONS` in `scripts/adLookBlockImport.mjs` knows only E-commerce, Fashion,
  Beauty and Jewelry.** Art and Spaces are selectable industries with no importer mapping.
- **Retired ids cannot be re-imported.** Publishing a catalogue that omits a
  previously-published id retires it, and a later draft containing it is refused with
  `STARTER_CATALOG_ID_RETIRED`, a 409 that explains nothing (§17). Re-author under new
  ids; un-retiring by hand is second-best and needs a backup.

Finish by [`.claude/commands/looks.md`](../../commands/looks.md): read the bake's
`dropped blocks` / `paired before/after` / `verified round-trip` lines back as the report,
prove the artifact with the test above, `git diff --stat
server/builtin-starter-catalog.json`, commit with the counts in the message, ship — **and
tell the founder the last step, because baking alone changes nothing live**: the owner
presses *Publish catalog from git* in production.

---

## Known-unresolved

Fashion's casting cards also specify stance (*"weight on one hip"*) and framing
(*"full-length frame"*). Both arguably belong to other slots — framing is literally
Camera's job — and baking them in makes Casting fight the pieces it stacks with.
Untested. If a Jewelry casting fights a Camera piece, try removing this first.

Fashion Full Shots is **parked, not finished**, and its eight `c0*` ids are retired
(§17). Do not repurpose `complete`, do not delete its assets, and do not quietly re-add
those Looks because a tab looks empty.
