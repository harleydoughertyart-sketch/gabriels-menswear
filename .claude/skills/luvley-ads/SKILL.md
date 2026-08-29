---
name: luvley-ads
description: Run a round of Luvley ad cards, refine one, or record the founder's verdict on a set. Use when the founder asks for ads, more ads, another batch, a variation on a card he liked, or when he reacts to rendered ads with praise, criticism or a change.
---

# Luvley ads

Build a **round** of ad **cards** for Luvley — one agent per card, in parallel —
then bring the founder a numbered sheet he can pick from.

Two files carry the rest, and each has one audience:

- [`LEDGER.md`](LEDGER.md) — the founder's accumulated taste: his verdicts in his
  own words, the rules they imply, and the **canon**. Read it before you design
  anything. It is the only file that grows.
- [`CARD-BRIEF.md`](CARD-BRIEF.md) — what a card agent reads. You paste a pointer
  to it into every dispatch; you do not summarise it.

## Every instruction he gives is permanent or once, and you ask which

This is the rule the whole system compounds on, and it fires **mid-run**, not at
the end. The moment he says anything that changes a card — a colour, a size, a
layout, a word, a treatment — settle which it is before you act:

> **Permanent or once?**

Ask it in those terms, in one line, alongside doing the work. Do not batch these
up for later; a verdict you did not record is a verdict you will re-learn.

- **Permanent** → write it into `LEDGER.md` as a rule, in his words, with the
  quote that produced it. Every future round inherits it.
- **Once** → apply it to that card and say so, so nothing else in the set moves.

When his wording already settles it ("from now on", "always", "in this one"),
skip the question and record it. Ask only when it is genuinely ambiguous — a
question he has already answered is friction, and friction is what stops a
feedback loop compounding.

## Running a round

### 1. Read the ledger, then fix the round's shape

How many cards, and what spread of arguments. A round is worth running wide: 30
agents cost one wall-clock hour, and the fixed cost is yours, not theirs.

Weight the spread toward what the ledger's **canon** already proves, and spend
the rest on genuinely new shapes. A round that is all variations of a winner
teaches nothing; a round with no winners in it wastes the pick.

### 2. Write one concept per card

Each concept names: the card id, the aspect (`1x1` or `4x5`), the ground, and the
argument in a sentence or two of prose. Give each agent the reason its card
exists — the founder quote or the ledger rule it answers — because an agent that
knows why is the one that pushes back when the concept is wrong.

Concepts must differ by more than a number. Two cards that differ only in aspect
ratio are one card rendered twice.

### 3. Dispatch one agent per card, all in one message

`isolation: "worktree"`, one card each. Every prompt is short: the card id, its
concept, and a pointer to `CARD-BRIEF.md`. The brief carries everything shared —
paraphrasing it into thirty prompts is thirty chances to drift.

Each agent writes ONE file, `scripts/ads-v4/<card id>.mjs`, and touches no shared
module. That is what makes the fan-out collision-free.

### 4. Hold the shared layer yourself

Agents will find defects in the shared modules — they did seven times in the
first round, none of which a code review would have caught. When one reports a
shared-layer bug, you fix it in the module; when several report the same one, fix
it and say so in the commit, because a defect that bit five agents is a fact
about the module, not about them.

**A shared rule must never outrank its callers.** A fix of the form
`.frame > *:not(.x){…}` is two classes and beats a card's own single-class rule —
that exact fix silently broke six cards while looking like a repair.

### 5. Land every card, then re-render the whole set from the merged tree

Not optional, and it is the step that earns its keep. Each agent's worktree was
green against the shell as it existed when that agent ran; the set has to be
green against ONE shell. The first round's sweep found seven broken cards that
were individually passing.

```bash
node scripts/fleet.mjs land agent-<id>
```

Then run every `scripts/ads-v4/*.mjs` in sequence and report the failures.

### 6. Send him a numbered contact sheet

Numbered **continuously across every round**, so a card he names stays that card.
Sheets go to him as images in the thread — he reads on a phone, and a path to an
HTML file is a dead end. Keep each sheet under ~300 KB; split by round rather
than shrinking past legibility.

The phone twin under `phone/` is what a sheet is built from.

### 7. Take his verdicts into the ledger

Quote him. A paraphrase loses the thing that makes a verdict reusable — "it feels
a little bit too boring" and "this needs more visual interest" are not the same
note, and only one of them tells you what he was looking at.

Record every card he names, including the ones he liked and said nothing more
about. Mark the rest **unjudged**, never *rejected*: he goes through a sheet at
speed and names what stands out in both directions.

## Refining a card

He picks winners, then gives notes on them. For each note:

1. **Permanent or once**, per the rule above.
2. Change the card's own file. One card, one file, so a note never spreads.
3. Re-render and look at the phone twin before reporting.

When a card he has already praised gets a note, the note is about that card only
unless he says otherwise — a rule inferred from a single correction is how a
system drifts away from the taste it was built on.

## Promoting a winner into canon

When he calls a card a favourite, or picks it for the campaign, write it into the
ledger's **canon** section: what the card is, and the specific thing that makes
it work — the layout move, the copy shape, the treatment. Canon is what the next
round's concepts are weighted toward, so it has to say what to *reuse*, not just
which card won.

A canon entry that only names the card is a bookmark. Name the mechanism.
