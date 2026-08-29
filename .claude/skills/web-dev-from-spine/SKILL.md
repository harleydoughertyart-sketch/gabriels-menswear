---
name: web-dev-from-spine
description: Build a web page or a whole site from a spine — interview, claims audit, question ladder, copy, rendered concepts per section, then build.
disable-model-invocation: true
---

# Web Dev from Spine

A page is not designed section by section from the top. It is designed **spine first**, then
**laddered**, then **written**, then **drawn**, and only then **built**. Every step below exists
because skipping it cost a real day of work.

Two loops:

- **The page loop** — phases 0 to 7, once per page.
- **The reroll loop** — phase 6, once per section, as many times as it takes. A section is `open`
  until the founder says `locked`. Most of the value is here.

Run phases in order. Do not begin a phase whose input is still `open`.

---

## Phase 0 — Interview for the spine

**Read [`copywriting-kb.md`](copywriting-kb.md) first.** It holds the value equation, Schwartz's
awareness levels, the question ladder, the claim discipline, and — the part this phase runs on — a bank
of probing questions organised by what each one extracts. A generic question gets a generic spine, and
a generic spine produces a page that could belong to any competitor.

**The spine is eight sentences**, and everything downstream derives from it:

```
Visitor · Problem · Outcome · Mechanism · Difference · Proof · Objection · CTA
```

You do not ask for those eight directly. You **interrogate the four terms of the value equation** and
assemble the spine from the answers, because a founder can tell you what happens to a customer but
cannot usually state his own dream outcome in the abstract.

**Ask one question at a time and wait.** A list gets one paragraph back that answers two of them. Then
follow the answer — **the second question in a thread is where the real material is**. Pick two or
three probes per term from the bank; running all of them is an interrogation, not an interview.

Three of the bank's probes do disproportionate work, so reach for them early:

- *"If a competitor copied this page word for word, which sentence would become a lie?"* — if none
  would, there is no positioning yet and the page cannot be written. Stop and solve that first.
- *"What do they get to stop doing?"* — reaches the dream outcome past the feature list.
- *"What familiar thing takes about that long?"* — converts a timing into an **anchor**, which is what
  ships. A bare number invites arithmetic; an anchor is felt, and survives the timing drifting.

Look up anything the environment already knows — what pages exist, what the product does, what the
current copy says — rather than asking. **Ask only what lives in his head.**

Then bound the work, because these four decide what every later phase is allowed to cost:

- **What is already good?** Rewriting something he likes is pure loss.
- **Who supplies the media, and what does each image cost him?** If he pays per image, every concept
  must state its media cost and at least one must be genuinely cheap.
- **Does this design have to serve other pages?** If one component renders several, every concept
  needs a **duplication test** — how it survives swapped content.
- **Where is the brand constitution?** Read its restraint rules, not just its palette.

**Done when:** eight sentences exist, he has seen them, and he agrees. Not before.

---

## Phase 1 — Evidence brief

Read the **product**, not the current page. The page is a claim; the code is the fact.

Sort every claim the page makes into three buckets, and keep the buckets:

| bucket | meaning |
| --- | --- |
| **confirmed** | proved in code, safe to publish, cite `file:line` |
| **needs support** | plausible, unproved — omit or qualify |
| **contradicted** | the code says otherwise — this is a live defect, report it |

Two things this catches every time, and both are worth the phase on their own:

- **Live false claims.** Copy drifts from code silently. Check prices, entitlements, counts, and any
  sentence with a number in it.
- **A test pinning a falsehood.** When a false claim has survived a long time, look for the assertion
  holding it there. Fixing the copy without the test just turns the suite red.

**Voice lives in the product too.** The FAQ, the error copy, the empty states — that register is
closer to how the founder actually talks than anything written for marketing. Mine it before writing.

**Done when:** every claim is in a bucket, and every contradicted one has been reported to him.

---

## Phase 2 — The ladder

**Order sections by the questions a buyer asks, in the order they ask them.** This is the highest-
leverage move in the whole process and it is usually a re-order of what already exists, not new work.

Write the ladder as questions before touching layout:

```
(before any question)  What do I even get?          -> the hero
Q1  How do I get that, when I'm not an expert?      -> the mechanism section
Q2  What will mine actually look like?              -> the proof section
Q3  How does it work?                               -> the steps
Q4  What is it doing for me that I'd otherwise do?  -> one section per capability
Q5  What does it cost me?                           -> price/cost
Q6  What else is stopping me?                       -> FAQ
                                                    -> close
```

**Cost goes after proof, never before it.** A cost argument made before anything desirable has been
shown is answering a question nobody asked yet — and no amount of restyling fixes that. If a cost
section feels flat no matter what you do, it is in the wrong place.

**One section, one question.** Two sections answering the same question means one gets cut. Sections
that survive only because they exist are how pages get long.

**Done when:** he has locked the section list and its order. Structure is his call, not yours.

---

## Phase 3 — Copy

**Load the project's copywriting skill first.** Writing from instinct is the single most reliably
rejected thing in this process.

Write in parallel across section groups, then **unify**. Four writers produce four voices, the same
claim made three ways, and mismatched CTAs — the merge pass exists to fix exactly that, and to *cut*
a section that adds no new reason rather than rewrite it.

Rules that survive every round:

- **Skimmable.** A headline carries the argument; the body is one or two short sentences. If a
  section needs a paragraph, it is doing two jobs.
- **Numbers only where measured.** If nothing measures it, say the structural truth instead — name
  the steps that disappear, which are true by construction.
- **When the founder supplies a real number, use an anchor, not a metric.** "Sooner than you would
  have written the caption yourself" survives a timing change; "in five minutes" becomes a liability.
  The best anchor names the task being replaced, so it measures and reminds at once.
- **Never write copy the product's own engine writes.** If the app generates ad copy, product copy or
  headlines, run it and pick from the output. Hand-writing it and pasting it in bypasses the engine
  and produces bloated generic text — and it misrepresents the product on its own site.
- **Keep good existing lines.** A pass that keeps a shipped headline because nothing beat it is a
  success, not a failure.

**Done when:** he has read the copy per section and approved or redlined it. Approved copy is the
input to phase 4 — layout designed before copy guesses at word length and gets rebuilt.

---

## Phase 4 — Concepts

Render 2–3 concepts per open section, built around the **approved copy**, using an image model. These
are layout studies: garbled letterforms are expected and fine.

**Concepts must differ in organising principle, not in arrangement.** This is the rule that gets
broken every time. Three boxes in a row, then three boxes in a row with the copy moved, is one idea
twice — and the founder will say the whole round felt samey without being able to say why. Make each
agent state, in writing, what the previous attempts' organising principles were and why its own is
not those.

Each concept declares:

- **Organising principle** — one sentence.
- **Named reference** — a real site or publication it borrows from. No named reference means no
  research happened.
- **Motion** — what moves, in what order, on load versus on scroll, plus the reduced-motion state.
  Design so the **still frame reads without it**.
- **Media cost** — how many images, what shape. At least one concept per section should be cheap.
- **Duplication test** — how it survives swapped content, when the component serves several pages.
- **Its own strongest counter-argument.** Requiring this surfaces weaknesses the founder would
  otherwise have to find.

**Watch for a section borrowing another section's visual grammar.** Three thumbnails joined by arrows
is a how-it-works strip; if a hero uses it, the hero is duplicating a section further down and will
feel weak no matter how it is styled.

**Done when:** every open section has concepts on the sheet.

---

## Phase 5 — The sheet

One self-contained HTML file, images inlined as data URIs so it survives being moved. Open it with an
absolute path to the browser executable — the OS default may open an editor instead.

The sheet is the review surface and it has three jobs:

- **Today's shipped version sits above the concepts** for any section that already exists. Judging
  against nothing produces "they're all fine".
- **Rejected concepts stay.** The progression is what makes the current round legible.
- **A decision record at the top** — every section, `locked` or `open`, with the chosen concept named,
  plus any global corrections (a motif change, a retired word) so they survive into the build.

When a section passes about six options, add a thumbnail strip at the top of its block so he can scan
the set before reading any of it.

---

## Phase 6 — The reroll loop

Per section: he reacts, you reroll, until he says locked. Expect three to five rounds on the hardest
section and one on most.

**Read his rejection for which kind it is** — they need opposite responses:

| he says | it means | do |
| --- | --- | --- |
| "too busy", "too much going on" | density | strip, do not redesign |
| "doesn't make sense", "I'd be lost" | comprehension | change what is being sold |
| "these all feel the same" | organising principle | change the idea, not the layout |
| "I don't like the words" | copy | back to phase 3 for that section |
| "make it nicer" | craft | same idea, higher execution |

**The novice test is the pass/fail.** Someone who has never used the product, scanning for four
seconds, with no prior knowledge — what do they take away? Write the expected takeaway as one
sentence before designing, and make each concept answer it explicitly. A concept that needs a caption
to be understood has failed.

**Sell the outcome, not the machinery.** The most common comprehension failure is explaining how the
system works. Modularity, pipelines, and architecture are power-user ideas; to a first-time visitor
they read as complexity — as work she will have to do. Show what she gets.

**Explaining is the failure mode.** When a section keeps failing, the fix is almost never a better
diagram. It is fewer things on the page. Ban diagrams, stage rows, arrows and annotated screenshots
from that section and see what survives.

**When a section fails three rounds, stop designing and ask him for the angle.** Four failed layouts
means the strategy is wrong, not the composition. Bring him three or four positioning options with
the honest backing for each, let him pick, then design against the winner — a narrow brief lands
where a broad one keeps missing.

**Done when:** he says locked. Record it in the sheet's decision record immediately.

---

## Phase 7 — Build

Only when every section is locked.

- **Content is data, not markup.** Tile lists, copy, image paths and captions live in a content
  catalog so swapping final media later is a content edit, not a layout rebuild.
- **The renderer never branches on which page it is.** Everything page-specific arrives as data. This
  is what makes one design serve every page.
- **Media last.** Stand-in imagery already committed to the repo is enough to judge layout. Never
  render final imagery before the layout is locked — that is the most expensive mistake available.
- **Preview a section in isolation before wiring it in.** A board that renders the real component with
  real data at a real viewport width, off the live page, is worth building once and using forever.
- **Ship a before/after sheet** at the widths the change lives in.

---

## Media

**Media comes last and the founder usually supplies it.** Every concept states its media cost so he
can choose the cheap one; the build uses stand-ins; he swaps in finals when the layout is settled.

When the product itself produces the imagery, produce it **through the product's own pipeline** — the
same path a customer takes. Imagery invented outside it misrepresents what the product does, and he
will spot it immediately.

---

## The traps, collected

Each of these cost real time. They are the reason the phases are ordered as they are.

1. **Media before locked layout.** Renders for slots that then move.
2. **Concepts that differ only in arrangement.** Feels like a wasted round to him and he cannot name why.
3. **A section using another section's visual grammar.** Reads as weak; the cause is duplication.
4. **Explaining the machinery.** The novice is lost by the thing that makes it impressive to you.
5. **Hand-writing copy the product's engine should write.** Bloated, generic, and dishonest on its own site.
6. **Copy from instinct instead of the copywriting skill.** Reliably rejected.
7. **Unmeasured numbers.** And their opposite — refusing a real number the founder can stand behind,
   when an anchor would carry it.
8. **Cost argued before proof.** No styling fixes a section in the wrong position.
9. **Dropping rejected concepts from the sheet.** Removes the baseline that makes judging possible.
10. **Two agents in one file.** Work gets lost. One agent per file, always.
11. **A test pinning a false claim.** Fix the copy and the suite goes red; find the assertion.
12. **Selling a capability that exists in code but has no caller.** Check for callers, not definitions.
