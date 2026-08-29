---
name: meta-ads
description: How Meta's ad platform actually works — the knowledge base, not the taste. Use when building, judging, pausing or scaling a Facebook/Instagram campaign, ad set or ad; when budget, targeting, placements, bidding, the learning phase, Andromeda, Advantage+, creative volume, the pixel, CAPI, CPC/CPA/ROAS or the Meta Ads MCP come up; and before asserting anything about ad account 976311594106108.
---

# Meta ads — the platform

**This skill exists because a stale fact was stated as a current one, twice in one
day, and the founder had to correct it.** Not a gap in knowledge. Confidence
without a date.

So the load-bearing property here is not coverage — it is **currency**. A knowledge
base of undated claims is worse than no knowledge base, because it launders
staleness into authority.

## The currency rule

**Every claim in these files carries a tier marker, a source URL, and the date it
was read.** No exceptions, including claims that seem obviously true.

| Marker | What it is | How fast it rots |
| --- | --- | --- |
| **[MECHANIC]** | Something Meta documents about how the system behaves | Slowly. Still check the date before betting money on it. |
| **[GUIDANCE]** | Meta's own recommendation or best practice | Fast. Meta reverses these. Two live examples are flagged in `CREATIVE.md`. |
| **[LIVE]** | Our account's state | Hourly. **Never remembered. Always read.** |
| **[CONTESTED]** | Meta says two things, or Meta and the repo disagree | Both sides are quoted with both dates. Do not pick one silently. |
| **[UNVERIFIED]** | Believed true, no primary source found | Say so out loud when you use it. |

Three rules follow, and they are what make the marker mean anything:

1. **A [LIVE] claim is never answered from a file.** Before asserting anything
   about ad account `976311594106108` — is there a Page, what is running, what did
   it spend, does a pixel event exist — **call the tool.** `MARKETING-API.md` maps
   the common questions to the tool that answers each.
2. **Report the date with the claim** when it matters to a decision. "Meta's help
   centre said on 2026-08-26 that…" is checkable. "Meta doesn't split evenly" is
   not, and is how this skill's founding mistake happened.
3. **A marked gap beats a smoothed-over assertion.** If you cannot source it,
   write **[UNVERIFIED]** and move on. Do not fill the hole with fluency.

## Which file answers what

`SKILL.md` is a router and loads every time. The reference files carry the depth
and are read one at a time — open the one that answers your question, not all of
them.

| File | Open it when the question is |
| --- | --- |
| [`DELIVERY.md`](DELIVERY.md) | How does Meta actually spend money inside an ad set? The auction, Andromeda, why delivery concentrates on winners, the learning phase and exactly what resets it, pacing, why splitting a budget across ad sets hurts. |
| [`CREATIVE.md`](CREATIVE.md) | How many creatives, and what does the platform do to them? Creative volume (both sides), Advantage+ creative enhancements and how to turn them off, image specs, fatigue, how a static behaves per placement. |
| [`CAMPAIGN-STRUCTURE.md`](CAMPAIGN-STRUCTURE.md) | What do I set, and at which level? Objectives, performance goals, bid strategies, ABO vs Advantage campaign budget, the full placement enums, audiences, attribution. |
| [`MEASUREMENT.md`](MEASUREMENT.md) | Why do the numbers disagree? Pixel and CAPI, deduplication, event match quality, consent, custom audiences, and the specific reasons Meta's count differs from GA4's and from ours. |
| [`MARKETING-API.md`](MARKETING-API.md) | How do I read or change something programmatically? The MCP tool→question map, the create sequence, field names, and **how to fetch a Meta doc** — including the two surfaces that need different techniques. |
| [`OPERATING-PLAYBOOK.md`](OPERATING-PLAYBOOK.md) | It is running and something looks wrong. Day-N judgements, budget changes, one ad eating delivery, a dead creative, switching the optimisation event. **Start here mid-flight.** |
| [`ACCOUNT.md`](ACCOUNT.md) | What is true of *our* account? Ids, history, blockers — every line marked verified-live or from-a-doc-dated-X. **Read the live-read rule at the top before quoting any of it.** |

## Boundary with `luvley-ads`

[`.claude/skills/luvley-ads/`](../luvley-ads/SKILL.md) owns the **founder's taste**
and the card-making process — the ledger of his verdicts, the card brief, how a
round is run. **This skill owns the platform.**

The seam: *what to make* is `luvley-ads`; *what happens to it once Meta has it* is
here. Neither duplicates the other. When a card decision turns on a platform fact
(an aspect ratio, a text limit, whether Meta will re-crop it), cite this skill from
there rather than restating the fact.

## What this skill does not know

Said plainly, so silence is not read as coverage:

- **Nothing about our live account.** No `ads_*` tool was reachable when these
  files were written, so **not one account fact in `ACCOUNT.md` is verified-live** —
  every line is from a repo document with a date on it. Read the account before
  quoting it.
- **Stories and Reels image specs.** The Facebook Feed and Instagram Feed specs in
  `CREATIVE.md` were read from Meta's Ads Guide; the Stories/Reels pages were not
  reachable at a guessable URL. Marked in place.
- **Which fields are immutable after creation.** Widely believed for `objective`;
  no primary source found. Marked **[UNVERIFIED]** in `CAMPAIGN-STRUCTURE.md`.
- **Aggregated Event Measurement's current shape.** The 8-event priority list is
  repo lore here, not a sourced claim.
- **Anything about spend, benchmarks or auction pressure after 2026-08-26.**

## The pattern, for the next one of these

This is a **router plus on-demand reference**: one short always-loaded file whose
job is to say what exists and when to open it, and a set of long files that load
only when opened. The repo already uses this shape — `AGENTS.md` over
`docs/agents/*.md` — and it works for the same reason: the router costs tokens on
every turn, the depth costs nothing until it is needed.

Build one this way for Stripe, GA4 or Google Ads if the same failure appears
there: an agent asserting a platform fact from memory, confidently, wrong. Copy
the currency rule verbatim — the tier markers and the dated citations are the part
that does the work. A tidy set of files without them is just a place for staleness
to live.
