# Delivery — how Meta actually spends the money

Every claim carries a tier marker, a source and a read date. Tiers are defined in
[`SKILL.md`](SKILL.md). Unless a line says otherwise, **"read 2026-08-26"** means
the page was fetched that day and quoted from.

---

## 1. The equal-split myth, killed with Meta's own sentence

This is the single most load-bearing fact in this file, because reasoning from the
opposite of it produced bad advice to the founder on 2026-08-26.

> **[MECHANIC]** "If you have multiple ads in your ad set (or across your account),
> we'll show the ad that's most likely to achieve the lowest cost per optimization
> event for the given person. **This means that each of your ads won't necessarily
> be delivered the same number of times.**"
>
> — Meta, *About ad delivery*,
> <https://www.facebook.com/business/help/1000688343301256>, read 2026-08-26.

And the same page, on why the biggest spender is not necessarily the best
performer:

> **[MECHANIC]** "Sometimes, the ad or ad set that gets the most results isn't the
> ad set that received the lowest cost per optimization event. That's because the
> ad delivery system uses **predictions of future performance** to determine where
> to deliver next – not each ad set's past performance."
>
> — same page, read 2026-08-26.

**What follows, and what does not.**

- Arithmetic of the form *"$700 = 700 clicks ÷ 12 ads = 58 clicks each"* is
  invalid. Delivery is allocated per-impression by predicted cost, not divided by
  headcount.
- **It does not follow that more ads is free.** Meta's ad-volume guidance argues
  the opposite, in the same help centre, and that tension is real — see
  [`CREATIVE.md` §1](CREATIVE.md). Two true things sit next to each other here;
  do not collapse them.
- The genuine cost of running many ads is **attribution, not delivery**: if the
  system concentrates on two of sixteen, you learn those two won. You do not learn
  the other fourteen lost, because most never got enough delivery to be judged.

**Stale item to name, never silently fix.**
`docs/launch/CANARY-GO-REPORT.md:635-636` (written 2026-08-13) says *"3-4 statics.
Below 3 nothing is comparable; above ~5 each creative gets too few clicks for CTR
differences to separate from noise."* That line models delivery as an equal split
and carries no reasoning. The founder overturned it on 2026-08-26 and the overturn
is recorded at `D:\Luvley Ad Campaign\CAMPAIGN-BUILD-SPEC.md` §4.1. **The
go-report line stands in that file as history — do not edit it, cite the overturn.**

---

## 2. The auction

> **[MECHANIC]** "the winner of the auction is the ad with the highest **total
> value**, subject to a price floor (minimum price) that may affect whether an ad
> is shown and the price paid. The total value is a combination of 3 major
> factors:
>
> **Bid**: The bid placed by an advertiser for that ad […]
> **Estimated action rates**: An estimate of whether a particular person engages
> with or converts from a particular ad […]
> **Ad quality**: A measure of the quality of an ad as determined from many
> sources including feedback from people viewing or hiding the ad and assessments
> of low-quality attributes in the ad, such as withholding information,
> sensationalized language and engagement bait."
>
> — Meta, *About ad auctions*,
> <https://www.facebook.com/business/help/430291176997542>, read 2026-08-26.

> **[MECHANIC]** "Together, estimated action rates and ad quality measure **ad
> relevance**. Because these are components of the auction, an ad that's more
> relevant to a person could win an auction against ads with higher bids."
>
> — same page, read 2026-08-26.

**Operational reading:** creative quality is not a soft factor sitting beside the
bid. It is two of the three terms. A better ad literally lowers the price of the
same delivery.

> **[MECHANIC]** "Billions of auctions take place every day on Facebook and other
> Meta technologies." — same page, read 2026-08-26.

### Auction overlap — your own ads do not bid against each other

> **[MECHANIC]** "When 2 or more ads from the same advertiser enter the same ad
> auction, we choose the ad with the highest total value to compete in the
> auction. As a result, other ads from that advertiser are not considered in this
> auction. **This ensures that your ads will not bid against one another.**"
>
> — Meta, *Understand auction overlap*,
> <https://www.facebook.com/business/help/537699989762051>, read 2026-08-26.

> **[MECHANIC]** "Since auction overlap prevents ads from entering auctions,
> auction overlap can prevent an ad set from spending its full budget or achieving
> enough results to exit the learning phase. […] Running ads from separate ad
> accounts may not help you avoid overlap."
>
> — same page, read 2026-08-26.

**So:** overlapping ad sets do not bid your price up, but they *do* starve each
other of auction entries, which is one of the named causes of `Learning limited`
below. This is the mechanism behind "combine your ad sets".

---

## 3. Retrieval and ranking — Andromeda, and what it is not

The auction is the *last* stage. Before it, the candidate pool has to be narrowed.

> **[MECHANIC]** "Retrieval is the first step in our multi-stage ads recommendation
> system. This stage is tasked with selecting ads from **tens of millions of ad
> candidates into a few thousand** relevant ad candidates."
>
> — Meta Engineering, *Meta Andromeda: Supercharging Advantage+ automation with the
> next-gen personalized ads retrieval engine*, published 2024-12-02,
> <https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/>,
> read 2026-08-26.

Measured results Meta reports for it, same post:

| Claim | Figure |
| --- | --- |
| Recall improvement to the retrieval system | **+6%** |
| Ads quality improvement on selected segments | **+8%** |
| End-to-end model inference queries per second | over **3x** |
| Feature extraction latency and throughput | over **100x** |
| Increase in complexity of models usable for retrieval | **10,000x** |

Hardware named: NVIDIA Grace Hopper Superchip, and Meta's own MTIA.

**[MECHANIC]** **Andromeda is a retrieval engine, not a creative-testing product.**
The 2024-12-02 post says nothing about how many creatives an advertiser should
run, and does not claim to turn losing ads off. Meta's argument that Andromeda
rewards creative *diversity* is made in a separate marketing post, not in the
engineering post — see [`CREATIVE.md` §2](CREATIVE.md), where both are quoted.

**[MECHANIC]** The ranking stage below retrieval has moved again since. Meta
Engineering published *From User Sequences to Scaling Laws: A Multi-Stage
Architecture for Meta's Ads Ranking* on **2026-08-05**
(<https://engineering.fb.com/2026/08/05/ml-applications/from-user-sequences-to-scaling-laws-a-multi-stage-architecture-for-metas-ads-ranking/>,
read 2026-08-26), describing an offline user model producing cached embeddings
plus an online ranking model, under the **GEM** (Generative Ads Recommendation
Model) platform announced November 2025. It gives no per-stage candidate counts
and says nothing about advertiser structure or creative.

**Why this matters for how you talk about it:** "Andromeda picks the winners and
turns off the losers" is directionally right about *delivery concentration* (§1
sources that properly) and is **[UNVERIFIED]** as a description of Andromeda
itself. Cite §1 for the behaviour; cite Andromeda for retrieval.

---

## 4. The learning phase

> **[MECHANIC]** "The learning phase is the period when the delivery system still
> needs to learn about how an ad set may deliver and perform. […] While the
> delivery system never stops learning about the best way to deliver an ad set, ad
> sets exit the learning phase as soon as they can deliver stably. **This usually
> occurs after about 50 results in the week after the ad set's last significant
> edit.**"
>
> — Meta, *About the learning phase*,
> <https://www.facebook.com/business/help/112167992830700>, read 2026-08-26.

**The ~50 figure is still current as of 2026-08-26** — it is on Meta's live page,
in those words. Two precisions that get lost when it is quoted from memory:

- It is **~50 results in the week after the last significant edit**, not 50 per
  week forever, and not a hard gate. "Exit as soon as they can deliver stably" is
  the actual criterion; 50 is the usual observed threshold.
- It is **per ad set**, and it counts the **optimisation event** you chose — not
  clicks, not impressions, not any conversion.

Special case, in Meta's own note: *"For Shops ads, you need a minimum of 17
purchases through your website and 5 through Meta for the learning phase to
complete."* (same page, read 2026-08-26).

### What counts as a significant edit — the exact list

> **[MECHANIC]** "Every edit you make (during the learning phase or after it) has
> some effect on delivery, but not every edit causes the ad set to reenter the
> learning phase. **Only a significant edit** causes an ad set to reenter the
> learning phase.
>
> The following are considered significant edits:
>
> - Any change to targeting
> - Any change to ad creative
> - Any change to optimization event
> - **Adding a new ad to your ad set**
> - Pausing your ad set for 7 days or longer (the ad set reenters the learning
>   phase once you unpause the ad set)
> - Changing bid strategy"
>
> — Meta, *Significant edits and learning phase*,
> <https://www.facebook.com/business/help/316478108955072>, read 2026-08-26.

And the may-or-may-not tier, same page:

> "A change to any of the following areas may or may not be significant, depending
> on the **magnitude** of the change: Ad set spending limit amount; Bid control,
> cost per result goal or ROAS goal amount; Budget amount. […] if you increase your
> budget from $100 to $101, that isn't likely to cause one or more ad sets to
> reenter the learning phase. However, if you change your budget from $100 to
> $1000, one or more ad sets may reenter the learning phase."

**Three consequences that decide real actions:**

1. **"Adding a new ad to your ad set" is a significant edit.** So a plan that holds
   creatives back as a day-5 swap-in is a plan to reset learning on day 5. Load
   everything at launch, or accept the reset knowingly.
2. **Pausing an ad set for 7+ days resets it.** Pausing an *ad* is not on the list.
3. **Not listed, and therefore not documented as significant:** pausing or
   unpausing an individual ad, changing the ad set's `end_time`, changing the
   ad name. Treat these as **[UNVERIFIED]**-safe rather than proven-safe.

Advantage+ campaign budget adds four answers, same page, read 2026-08-26:

| Question | Meta's answer |
| --- | --- |
| Does ACB distributing budget reset learning? | "No, ad sets within the campaign won't reenter the learning phase as budget is distributed." |
| Does an ad-set-level edit reset the *other* ad sets? | "No, as long as the edit is made at the ad set level." |
| Does adding a new ad set reset the others? | "No." |
| Does switching campaign bid strategy reset them? | Yes — "switching your campaign bid strategy might cause **multiple** ad sets within the campaign to reenter the learning phase." |

### Learning limited

> **[MECHANIC]** "Learning limited isn't a penalty – it's an indication that your
> budget isn't being spent effectively because the ad delivery system can't
> optimize performance with your current setup. An ad set becomes learning limited
> when it is **unlikely to receive about 50 optimization events in the week after
> your last significant edit**."
>
> — Meta, *About learning limited*,
> <https://www.facebook.com/business/help/269269737396981>, read 2026-08-26.

Meta's own list of causes, same page:

> "small audience size, low budget, low bid or cost control, **high auction
> overlap**, an infrequent optimization event, or other issues such as **running
> too many ads at the same time**."

And its fixes, in Meta's order: combine ad sets and campaigns · expand your
audience · raise your budget · raise your bid or cost control · **change your
optimization event** to one that occurs more frequently ("for example, move from
purchases to add to cart").

> **[MECHANIC]** "Learning phase is not binary." An ad set that never exits still
> delivers — it delivers **more expensively and with higher variance**. Meta's page
> states this as "ad sets are less stable and usually have a higher CPA" during
> learning (*About the learning phase*, read 2026-08-26). Never report "it never
> exited learning" as "it did not run".

---

## 5. Budget — the sizing rule, and what pacing actually does

### The 10× rule

> **[GUIDANCE]** "In general, your **daily budget should be at least 10 times the
> average cost of your performance goal**. For example, if you want to optimize
> for link clicks and your average cost per link click is $5, your daily budget
> should be at least $50."
>
> — Meta, *About performance goals*,
> <https://www.facebook.com/business/help/355670007911605>, read 2026-08-26.

**This is the cleanest arithmetic available for choosing an optimisation event on a
small budget**, and it is Meta's own, not a blogger's. Read it backwards: a daily
budget of $B can support an optimisation event costing at most **$B/10**.

Worked, for the Luvley canary at $50/day (inputs from `ACCOUNT.md`, all
from-a-doc):

| Optimisation event | Est. cost each | 10× requires | Verdict at $50/day |
| --- | --- | --- | --- |
| Landing Page View / ViewContent | ~$0.75–1.25 | $7.50–12.50/day | Comfortable |
| Lead | ~$8–12 (modelled) | $80–120/day | Under-budgeted |
| CompleteRegistration | ~$12.50 (modelled) | **$125/day** | **2.5x under-budgeted** |
| Purchase | never fired | — | Impossible |

Cross-check against the ~50/week threshold, which is the other half of the same
question: at $50/day and $0.75–1.25 CPC, ~$350/week buys roughly 280–470 clicks. An
event that fires on 2% of clicks yields ~6–9/week. Both tests fail for
`CompleteRegistration` at this budget, and they fail for the same underlying
reason.

### Pacing

> **[MECHANIC]** Standard pacing (the default): "Meta enters your ad into every
> relevant auction and adjusts your bid over a day to produce smooth, optimal
> delivery relative to your objective and budget."
>
> Accelerated: "Meta enters your ad into all eligible auctions at its full maximum
> bid. […] delivery is not smooth throughout the day; your ad set's budget may be
> exhausted before the end of the day."
>
> — Meta for Developers, *Pacing and Scheduling*,
> <https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/overview/pacing-and-scheduling.md>,
> read 2026-08-26.

> **[MECHANIC]** "If you're using campaign budget optimization, budget pacing is at
> the **campaign** level. Otherwise, budget pacing is done at the **ad set** level."
> — same page, read 2026-08-26.

> **[MECHANIC]** "For ad sets running partial days, we adjust the first and last day
> spend based on the number of hours we have to deliver ads on those days."
> — same page, read 2026-08-26. *(This is why a mid-day start makes day 1 a partial
> day and distorts any day-5 read.)*

### Daily budget is an average, and it flexes ±75%

> **[MECHANIC]** "We are gradually introducing greater daily budget flexibility to
> some Meta Ads Manager accounts. This means on days when better opportunities are
> available for you, **we may spend up to 75% over your daily budget** on some days
> and less on others. On a weekly basis, **we won't spend more than 7 times your
> daily budget.** If your campaign is less than 7 days, the total spend will not
> exceed your daily budget, multiplied by the campaign duration."
>
> — Meta, *Understand fluctuations in ad performance*,
> <https://www.facebook.com/business/help/1364841787225722>, read 2026-08-26.

**So an $87 spend day on a $50/day budget is inside spec, not a bug.** The only
figure that means anything is the 7-day total. Note the rollout wording — "some
Meta Ads Manager accounts" — so whether it applies to `976311594106108` is
**[LIVE]**, read it.

### How to read the numbers while it runs

> **[GUIDANCE]** "Look at overall results. […] Be careful when using specific result
> breakdowns. For example, if you break down the results of your ad set by hour,
> you may see performance oscillations that average out over time. […] **Focus on
> the optimization event you chose for your ad set.** For example, if you've
> optimized your ad set for conversions, looking at the cost per thousand
> impressions (CPM) may not be a good indicator of performance. This is because the
> system may go after impressions with a higher cost, if that's how we can achieve
> lower conversion prices."
>
> — same page, read 2026-08-26.

---

## 6. Why splitting a budget across ad sets is worse than one funded ad set

Two independent mechanisms, both from Meta:

**Audience fragmentation.**

> **[GUIDANCE]** "Splitting your ad sets across these segments to find the ideal
> audience could **decrease performance** because your total audience size is split
> across multiple ad sets."
>
> — Meta, *Combine ad sets and campaigns in Meta Ads Manager to reduce audience
> fragmentation*, <https://www.facebook.com/business/help/2419480091640105>,
> read 2026-08-26.

**Learning-phase division.**

> **[GUIDANCE]** "When you run too many ad sets at the same time, each one gets fewer
> opportunities to learn and therefore fewer results. This means ad sets may spend
> **more time in the learning phase**, and you may spend more budget before the
> delivery system can fully optimize performance."
>
> — same page, read 2026-08-26.

**The arithmetic that makes it concrete:** the ~50-events threshold is per ad set.
Two ad sets at $25/day each need ~100 events between them to both exit; one ad set
at $50/day needs 50. The split doubles the bar and halves the rate at which each
half clears it.

**When a second ad set is nonetheless right:** when you are running a deliberate
comparison you intend to *read* — e.g. Reels/Stories placements against the same
statics — and you need the two independently funded so the system cannot
reallocate between them. That is the whole argument for ABO over Advantage
campaign budget in a test; see [`CAMPAIGN-STRUCTURE.md` §4](CAMPAIGN-STRUCTURE.md).

---

## 7. Placements — the worked example that argues against excluding them

Meta publishes an explicit numeric example for why per-placement cost is the wrong
metric. Quoted at length because the shape is the point:

> **[GUIDANCE]** "Say there are 11 opportunities to show your ad: 3 on Facebook, 3 on
> Instagram and 5 on Meta Audience Network. The Facebook opportunities cost $3 per
> optimization event. The Instagram opportunities cost $5 per optimization event. 3
> Audience Network opportunities cost $1 per optimization event, and 2 cost $7 per
> optimization event. You have a budget of $27.
>
> If you selected all 3 of these placements […] You'd get **9 optimization events
> for $27 at an average cost of $3 each.**
>
> If you saw these numbers, you might be tempted to turn off the Instagram
> placement. Here's what would happen: […] You'd only get **8 optimization events
> for $26 at $3.25 each** overall. This is a less efficient spend.
>
> The most important thing to remember is that **one placement's average cost per
> optimization event being higher than another's doesn't necessarily mean it's
> inefficient.**"
>
> — Meta, *How the Meta delivery system works using Advantage+ placements*,
> <https://www.facebook.com/business/help/965529646866485>, read 2026-08-26.

The mechanism, same page:

> "the Meta ad delivery system is designed to get you the most optimization events
> […] at the **lowest average cost overall - not the lowest average cost for each
> placement.**"

**[CONTESTED] against the repo.** `docs/launch/CANARY-GO-REPORT.md:637-642`
(2026-08-13) instructs manual placements excluding all Reels, Stories, in-stream,
Audience Network and Messenger, on the reasoning that Meta auto-crops a static into
9:16 and buys junk impressions. That reasoning has a real mechanism behind it —
see [`CREATIVE.md` §5](CREATIVE.md) for the `adapt_to_placement` / `image_uncrop`
features — but it is **directly opposed to Meta's own recommendation**, and the
go-report's own corrections section (`:51-57`) already softened it to a sequencing
call rather than a reversal. Carry both, dated. Do not present either as settled.

---

## 8. What a 14-day, $700 test can and cannot conclude

**Can conclude:**

- Whether the channel produces the optimisation event **at all**, and at roughly
  what cost. A cost-per-event that is 3–5x off target is a real signal at any
  sample size.
- Whether the tracking chain fires end to end under real traffic — which is
  usually the more valuable output of a first campaign. See `MEASUREMENT.md`.
- Whether a creative direction is **viable**. Delivery concentration means the
  winners surface fast; that is what §1's mechanism buys you.
- Enough retargetable audience to make a second campaign possible.

**Cannot conclude:**

- **A ranking of every creative.** Most will not get enough delivery to be judged.
  The honest readout is "two winners and N unknowns."
- **A landing-page A/B.** Separating an 8% conversion rate from 12% needs roughly
  800 sessions per arm; $700 buys 700–930 clicks **total**.
- **A stable CPA.** If the ad set is `Learning limited` for the run, Meta's own
  framing is that the reported cost per result is unstable by construction.
- **Anything about a placement, audience segment or hour-of-day** read from a
  breakdown — see §5's warning about breakdowns, and §7 on per-placement cost.
- **Anything about week 3+.** Creative fatigue starts inside the first 7 days for
  some ad sets ([`CREATIVE.md` §4](CREATIVE.md)); a 14-day read includes it, a
  scaled campaign will hit it harder.

**One trap specific to this account:** account-level aggregates blend $1,638.96 of
2025 Alura-era spend across two businesses and 11 months (`ACCOUNT.md`). **Scope
every report to the new campaign id**, or the baseline you compare against is
someone else's campaign.
