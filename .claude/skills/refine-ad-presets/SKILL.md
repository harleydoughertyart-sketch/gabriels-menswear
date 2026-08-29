---
name: refine-ad-presets
description: Rebuild an ad-layout preset as a six-slot design kit and prove it with a rendered tile. Use when converting, repairing or reviewing presets in client/src/adCreative/adLayoutPresets.ts, or when a preset tile does not match what the preset actually produces.
---

# Refining ad presets

The ad composer's Look page offers ~74 layout presets. Each appends a `direction`
to the render prompt and carries a thumbnail tile the seller chooses from.

**The contract, in the founder's words:** the tile is a promise, and the output
must honour it. *"They should be able to think this is what's gonna come out, and
when it comes out they should be like, yeah, that's what I got."*

Everything below exists because that promise kept getting broken.

## The one thing that made presets boring

A preset used to describe **one device** and let everything else fall to a house
default — so 74 layouts shared one typographic voice with one thing swapped.
`taped-print` said "tape on the background" and the headline, support and button
were identical to every other preset's.

The founder: *"That's what's making it look kind of boring — we get the vibe of
one of the presets, but it's only one thing being described… Each one should feel
like a visual design fully thought out, like a **kit**."*

So a preset is a kit: several elements chosen to argue for the same idea.

## The six slots

Every preset fills all six. **Terse attributes, not prose sentences.**

1. **STRUCTURE** — the device or layout idea that names the preset.
2. **HEADLINE** — face genre, weight, case, tracking, cap height as a fraction of the frame.
3. **SUPPORT** — face genre from a *contrasting category* to the headline (grotesque against serif, condensed against wide — never two near-identical faces), roman or italic, size as a fraction of the headline.
4. **CTA** — shape, size, fill or outline, and the type treatment inside it.
5. **ACCENT** — one or two marks emphasising a word **from the headline it was handed**, with an amount.
6. **PALETTE** — the colour *relationship*: which element takes the accent, what contrasts with what.

**Target ~130 words. Treat 155 as a hard ceiling.**

This is the discipline that makes it work, and it is counter-intuitive: you add
design information at the *same* word count by writing densely, never by writing
more. The repo has a recorded finding that Looks of 48–133 words were approved
while 212–280-word ones were rejected outright, because long prompts get read
past. A kit that grows to 200 words is a worse kit.

## Two rules live in `AD_LAYOUT_CLAUSE` — never repeat them per preset

The clause is prefixed to every preset. It already carries:

- **Headline and CTA legibility** — a size floor, because they are what a
  passer-by reads from across a room.
- **Brand-first colour** — accent colours derive from the seller's brand palette,
  falling back to the photograph when no brand is set.

So your PALETTE slot names the colour *relationship*, not its source. Your CTA
slot names shape, fill and treatment, not a legibility minimum. Duplicating a
clause rule inside a preset is how this catalogue got bloated before.

**Watch for the inverse problem:** ~60 unconverted presets still contain their own
colour language ("clear of every hue in the photograph", "absent from the
picture"). Preset text arrives *after* the clause, so those override the brand
rule and are a coin toss until rebuilt. Strip that language when you convert one.

## Founder-locked rules — read the module header in full

Each was learned expensively:

- **Visual only.** Never touches wording, tone or message.
- **Never authors copy.** A device needing words uses a line it was handed.
- **Art direction, not restriction.** Do NOT re-add a `supersedes` clause. Do NOT
  add a preservation or "hold the photograph" sentence — both were removed for
  cause, because they cancelled the planner's recomposition and removed the empty
  space the type was going to sit in.
- **Say what to ADD, never what to keep.** These models keep what they are not
  told to change; a prohibition costs latitude and buys nothing.
- **Every slot names an AMOUNT.** Effects specified without a strength came back
  at a fraction of the intensity asked for. A test enforces this.
- **Hierarchy comes from weight and size, never from fading text out** — a faded
  support line was measured failing AA contrast at this size.

### The accent boundary is absolute

An accent may only emphasise a word it was **handed**. It may never invent one.
Three presets once set a line twice, and one invented the words "SLOW DOWN" for a
badge it had no copy for. Where an accent could duplicate a line, use the
sanctioned exclusivity sentence: *"set the headline in the band and nowhere
else."*

## What the founder asks for, from his own reviews

Patterns worth applying before he has to ask again:

- **Unequal beats equal.** Four equal quarters read as a grid, not a design. Move
  seams off-centre so no two panels share a proportion.
- **Bolder headlines.** Repeatedly. If a headline is sized as a fraction of
  another element, pin it to a fraction of the **frame** instead — that is what
  makes it actually read bold.
- **Size the carrier to the lettering, not the lettering to the carrier.** The
  swing-tag CTA was tiny because the tag was fixed and the letters shrank to fit.
  Inverting that is what fixed it, permanently.
- **Fix "empty" with hierarchy, not more elements.**
- **Blurbs must say what the preset is FOR.** If he cannot tell when he would use
  it, that is the defect. Under about ten words, and never the word "template" —
  founder call, it reads cheap.
- **Do not over-promise.** `colour-flood`'s direction says "no part left original"
  and the model cannot deliver that on a product shot against a plain ground. A
  direction the model cannot honour is the same defect as a lying tile.

## Rendering — the tile must come from the real pipeline

Render through `composeAdRun` (`scripts/lib/harness-ads.mjs` → `composeAdPrompt`),
which is literally `[basePrompt, copyBlock, layout].join('\n\n')` — the same path
a customer's real ad takes. That is what makes a tile representative by
construction rather than by hope.

**Use the shared `AD_TILE_BASE_PROMPT` and `adBaseContamination` in
`scripts/lib/ad-looks-core.mjs`. Never write your own base.**

The single worst bug in this catalogue's history: the shared base was an
`informative` planner plan with its copy baked in, so it shipped an eyebrow,
headline, support line, **three icon benefit rows, a five-star proof line, a CTA
and a logo mark** onto all 83 tiles. With seven text elements and a device already
fixed, a preset could only change the tint. That is why every tile looked the
same *and* why none matched its preset.

**Hero image**, fed as the real file and not a description of one:
`D:\Luvley Looks Library\ad-tile-base\ad-tile-hero.png` — an acrylic charm
keychain: pink cloud character, pink bow, teal halo and wings, white
heart-envelope, silver chain, coral rubber heart, pale pink ground. Set the brand
to Luvley **pink** so the brand rule is exercised.

**Copy** comes from `AD_TILE_COPY_SETS` in `ad-looks-core.mjs` — three
founder-approved sets, one of them planner-authored and approved on review, with
provenance as a tested field. Vary them across a batch so the shelf reads as a
catalogue rather than one ad repeated. Never invent a fourth.

## Promote the tile to the card face

`client/public/block-previews/ad-presets-2026/<id>.webp`, matching the existing
files' format and dimensions.

**This step has been missed three times.** An evidence PNG is not a card face.
The founder judges the app, not the sheet — and a preset whose direction changed
without its tile being re-shot is a tile that lies, which is the whole defect.

## Delivering to the founder

He reviews on his phone and **cannot open HTML sheets.** Deliver one composite
PNG per preset: old tile and new tile side by side, clearly labelled, preset name
burned in as a header bar, ~1600px wide. Report absolute paths; the lead agent
posts them into chat.

Write them OUTSIDE the worktree — `D:\Luvley UI Evidence\<task>\` — or they die
with the worktree.

Also give one line per preset: type pairing, CTA treatment, accent. One line. He
reads it on a phone.

## Gates and traps

- `npm run check:fast` until it exits 0. **`no changes detected` is NOT a green** —
  it means the router saw nothing; run the covering suites by hand.
- Then `npm run check:full`.
- **Commit early and often.** A crewmate worktree ending with no commit is deleted
  within about a minute and everything in it is lost. This has already destroyed
  one agent's full output on this workstream.
- **Never combine rewrites and deletions in one commit.** A commit that rewrote
  presets *and* culled their neighbours collided with every concurrent branch —
  `folio-rule` was deleted next to `pull-quote` and git could not reconcile an
  edit against an adjacent deletion. Land culls separately.
- When several crewmates edit this file at once: land one, then `git merge
  developer` INTO the others. Never rebase — it is shared history.

## Verify before you believe a defect

An audit claim is a hypothesis. A working shipped Look has been declared broken
here by judging it on the wrong input. If you cannot reproduce a defect, say so
and stop rather than "fixing" something you never saw broken.

Equally, when a render disappoints, spend one extra roll before concluding the
direction is wrong — these models are stochastic, and one roll cannot separate a
bad prompt from bad dice.
