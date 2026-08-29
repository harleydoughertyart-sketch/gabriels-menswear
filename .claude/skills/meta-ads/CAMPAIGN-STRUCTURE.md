# Campaign structure — what you set, and at which level

Tier markers are defined in [`SKILL.md`](SKILL.md). "Read 2026-08-26" means the
page was fetched that day and quoted from.

---

## 1. The three levels, and what each owns

| Level | Owns |
| --- | --- |
| **Campaign** | Objective, buying type, special ad categories, spend cap, and — only under Advantage campaign budget — the budget |
| **Ad set** | Budget (under ABO), schedule, audience, placements, optimisation goal, bid strategy, billing event, attribution model |
| **Ad** | Creative, copy, destination URL, CTA |

**The learning phase lives at the ad set.** So does the ~50-event threshold, the
significant-edit list, and pacing under ABO. Everything in
[`DELIVERY.md`](DELIVERY.md) about learning is per ad set, never per ad and never
per campaign.

---

## 2. Objective vs performance goal — they are different things

> **[MECHANIC]** "The performance goal of your ad set **can be different from your ad
> objective**. For example, you can select Sales as your ad objective, but optimize
> for link clicks within an ad set."
>
> — Meta, *About performance goals*,
> <https://www.facebook.com/business/help/355670007911605>, read 2026-08-26.

> **[MECHANIC]** "When you choose a performance goal for an ad set, you're telling the
> ad delivery system to get you that result as efficiently as possible. In other
> words, your performance goal is **the desired outcome that our system bids on in
> the ad auction**."
>
> — same page, read 2026-08-26.

**So the optimisation event, not the objective, is what actually steers delivery.**
Reporting a campaign as "a sales campaign" says almost nothing about what Meta is
buying for you.

The budget-sizing rule attached to it — daily budget ≥ 10× the cost of the
performance goal — is quoted in full at [`DELIVERY.md` §5](DELIVERY.md). It is the
sharpest single tool for choosing an optimisation event on a small budget.

**[UNVERIFIED] — the ODAX objective enum list.** `OUTCOME_SALES`,
`OUTCOME_LEADS`, `OUTCOME_TRAFFIC`, `OUTCOME_AWARENESS`, `OUTCOME_ENGAGEMENT`,
`OUTCOME_APP_PROMOTION` are the six commonly cited, and the repo's build spec uses
`OUTCOME_SALES`. **No primary source was read for this list on 2026-08-26.**
Confirm from
<https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/basic-ad-creation/create-an-ad-campaign.md>
before relying on a specific string, and record the date here when you do.

**[UNVERIFIED] — which standard events each objective exposes as a
`custom_event_type`.** The repo's build spec asserts that `ViewContent` is offered
under `OUTCOME_SALES` with a website destination and generally not under
`OUTCOME_LEADS`. Plausible, unsourced. This decides whether the canary's chosen
optimisation event is reachable at all, so **verify it against the live account
before building**, not from this file.

---

## 3. Bid strategies

> **[MECHANIC]** The four values, quoted from Meta for Developers, *Bid Strategies*,
> <https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/overview/bid-strategy.md>,
> read 2026-08-26:

| Enum | What Meta says it does | When Meta says to use it |
| --- | --- | --- |
| `LOWEST_COST_WITHOUT_CAP` | "Meta automatically bids on your behalf and gets you the lowest cost results." | "You want to spend your full budget" |
| `COST_CAP` | "Get the most results possible while Meta strives to meet the cost per action you set." | "You want to maximize results while controlling cost-efficiency" |
| `LOWEST_COST_WITH_BID_CAP` | "Meta automatically bids for you and gets the lowest costs" within a ceiling | "You want to set a max bid across auctions to control cost" |
| `LOWEST_COST_WITH_MIN_ROAS` | "Specific bidding option for value optimization" | "If Return On Ad Spend is the primary measure of success" |

**Changing bid strategy is a significant edit** and resets learning
([`DELIVERY.md` §4](DELIVERY.md)). Under Advantage campaign budget, changing it at
campaign level "might cause **multiple** ad sets within the campaign to reenter the
learning phase."

**On a brand-new pixel, a cap suppresses delivery.** Meta's own `Learning limited`
page names "low bid or cost control" as a cause, and says a tooltip appears on the
status when that is the diagnosis (*About learning limited*,
<https://www.facebook.com/business/help/269269737396981>, read 2026-08-26). On a
first campaign with no conversion history, `LOWEST_COST_WITHOUT_CAP` is the
strategy that lets you find out what the real cost is; a cap decides the answer
before you have measured it.

---

## 4. ABO vs Advantage campaign budget (formerly CBO)

> **[MECHANIC]** "An Advantage campaign budget is a way of optimizing the
> distribution of a campaign budget across your campaign's ad sets. […] Facebook
> automatically and continuously finds the best available opportunities for results
> across your ad sets and **distributes your campaign budget in real time** to get
> those results."
>
> — Meta for Developers, *Advantage Campaign Budget*,
> <https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/guides/advantage-campaign-budget.md>,
> read 2026-08-26.

Mechanics from the same page, read 2026-08-26:

- Enabled by setting `daily_budget` or `lifetime_budget` **at campaign level**; the
  `adset_budgets` field *disables* it.
- Ad sets accept `daily_min_spend_target` / `lifetime_min_spend_target`, but "This
  target does not guarantee you spend this amount, but Facebook makes a best effort
  to achieve it."
- `budget_rebalance_flag`: "Do **not** use for Advantage campaign budgets."
- Campaigns with **more than 70 ad sets** under ACB "cannot edit bid strategy or
  disable the feature."
- Pacing moves to campaign level (see [`DELIVERY.md` §5](DELIVERY.md)).

**The decision rule.**

- **One ad set:** ACB and ABO are behaviourally identical. Pick either.
- **Several ad sets you want Meta to arbitrate between:** ACB. Meta recommends it
  as a cost-reduction lever — "Advantage+ campaign budget manages your campaign
  budget across ad sets to get you the overall best results" (*Best practices to
  potentially reduce cost per result*,
  <https://www.facebook.com/business/help/321695409726523>, read 2026-08-26).
- **Several ad sets you want to *compare*:** **ABO.** Under ACB, Meta reallocates
  toward whichever ad set wins early — which is exactly the behaviour that destroys
  the comparison you set the second ad set up to make. This is the argument for ABO
  in the canary: a week-3 Reels/Stories ad set has to be independently funded to be
  readable.

---

## 5. Placements

### The complete enum lists

> **[MECHANIC]** — Meta for Developers, *Placement Targeting*,
> <https://developers.facebook.com/documentation/ads-commerce/marketing-api/audiences/reference/placement-targeting.md>,
> read 2026-08-26.

| Field | Values |
| --- | --- |
| `device_platforms` | `mobile`, `desktop` |
| `publisher_platforms` | `facebook`, `instagram`, `threads`, `messenger`, `audience_network` |
| `facebook_positions` | `feed`, `right_hand_column`, `marketplace`, `video_feeds`, `story`, `search`, `instream_video`, `facebook_reels`, `facebook_reels_overlay`, `profile_feed`, `notification` |
| `instagram_positions` | `stream`, `story`, `explore`, `explore_home`, `reels`, `profile_feed`, `ig_search`, `profile_reels` |
| `audience_network_positions` | `classic`, `rewarded_video` |
| `messenger_positions` | `sponsored_messages`, `story` |
| `threads_positions` | `threads_stream` |
| `whatsapp_positions` | `status` |

Constraints, quoted from the same page:

- "If you do not specify anything for a particular placement field, Facebook
  considers **all possible default positions**." *(Omitting a field is not the same
  as excluding it — it is the opposite.)*
- "If you select `story` for `facebook_positions`, you must also select Facebook
  `feed` or Instagram `story`"
- "To deliver ads to Threads, include both `instagram` and `threads` under
  `publisher_platforms`"
- "To use the Threads `threads_stream` placement, you must select the Instagram
  `stream` placement as well"
- "To use the WhatsApp Status placement, you must select the Instagram story
  placement as well"
- "You cannot use Audience Network alone, so `publisher_platforms:
  audience_network` cannot be selected by itself"

**Note:** `explore_home` and `explore` are distinct values and both exist as of
2026-08-26 — the repo's build spec flagged `explore_home` as possibly unsupported;
it is documented.

### Meta's recommendation, and the counter-case

> **[GUIDANCE]** "It is recommended that you choose Advantage+ placements for your
> ads because it allows our delivery system to try to make the most of your budget.
> […] **Multiple placements increase the number of people who can see your ad and
> can improve ad results. Adding more placements does not increase the cost of your
> ad.**"
>
> — Meta, *About ad placements across Meta technologies*,
> <https://www.facebook.com/business/help/407108559393196>, read 2026-08-26.

The numeric worked example that argues against excluding a placement on
per-placement cost is quoted in full at [`DELIVERY.md` §7](DELIVERY.md). The
repo's opposing position, and the honest state of the evidence, is
[`CREATIVE.md` §6](CREATIVE.md).

**[MECHANIC]** One dated change worth carrying: "Starting in **March 2026**, the
Facebook Feed placement will include Facebook Friends tab." (same page, read
2026-08-26.) So `feed` is a broader surface than it was when older docs were
written.

---

## 6. Audiences

### Advantage+ audience

> **[GUIDANCE]** "Meta Advantage+ audience (or Audience with Advantage+ on) lets
> advertisers use Meta's advanced AI to find their Meta ad campaign audience. […]
> Meta's AI uses numerous pieces of information to find your audience, evolving
> constantly as it learns. For example: Past conversions · Meta Pixel data ·
> Interactions with previous ads"
>
> — Meta, *About Advantage+ audience*,
> <https://www.facebook.com/business/help/273363992030035>, read 2026-08-26.

Meta's reported lift, same page: Awareness "14.8% lower cost per result"; Traffic,
Engagement and Leads "9.7%"; Sales and App promotion "7.2%".

> **[GUIDANCE]** "Meta recommends A/B testing with Advantage+ audience for **almost
> all campaign types, except retargeting campaigns**." — same page, read 2026-08-26.

**Reading this for a first campaign with no conversion history:** the inputs Meta
names — past conversions, pixel data, prior ad interactions — are all things a new
account does not have. Advantage+ audience is still the reasonable default (a
hand-built interest stack on an empty pixel is guesswork that *also* shrinks the
pool, and a small pool raises CPM), but expect less from it than the quoted
percentages, which come from accounts with signal.

### Custom audience size — the repo's "1,000 floor" is not what Meta says

**[CONTESTED].** `docs/launch/CANARY-GO-REPORT.md` (2026-08-13) describes the three
Luvley audiences as "far below Meta's 1,000 targeting floor."

Meta's own current guidance is softer and different:

> **[GUIDANCE]** "If your audience size is still too small, consider: **Waiting until
> you have several hundred people** in your website custom audience before using
> it."
>
> — Meta, *Troubleshoot website custom audience size*,
> <https://www.facebook.com/business/help/237515166435276>, read 2026-08-26.

**No Meta page found on 2026-08-26 states a 1,000-person minimum for a website
custom audience.** A 1,000-person minimum *does* exist for **lookalike source
audiences** in common practice — that is **[UNVERIFIED]** here and may be the
origin of the conflation. Do not repeat "1,000 floor" as a Meta rule without
sourcing it.

At ~20 people per audience the distinction is academic for the canary — nothing is
targetable either way, and filling the pool is the campaign's most reliable
deliverable. It matters the next time someone plans a retargeting ad set off a
half-full audience.

---

## 7. Attribution

> **[MECHANIC]** "Meta Ads Manager lets you customize your ad attribution by choosing
> an **attribution model** and **attribution settings** (for standard attribution
> only) **at the ad set level**."
>
> — Meta, *About attribution models and attribution settings*,
> <https://www.facebook.com/business/help/460276478298895>, read 2026-08-26.

**Three models**, quoted from that page:

- **Standard** — "optimizes delivery for selected time windows and user behaviors,
  and allows advertisers to choose whether to credit conversions based on ad
  impressions, clicks and/or video plays."
- **Incremental** — "optimizes delivery for incremental conversions using models
  that predict whether a conversion is caused by an ad."
- **Custom** — "lets you share granular attribution data from your external
  analytics tool with Meta so our ad delivery system optimizes toward outcomes
  based on your attribution logic."

**Standard attribution settings**, same page:

| Setting | Window |
| --- | --- |
| Click-through | 1-day or 7-day after a link click |
| View-through | 1-day after an impression |
| Engage-through | 1-day after a **non-link** click; for video also a 5-second play (or 97% if shorter than 5s) |

**The comparison trap, in Meta's words:**

> "Results **cannot be compared** in the Campaign Overview table **across ad sets
> with different attribution models**. Each attribution model uses different
> counting mechanisms, and comparing across different attribution models will lead
> to inaccurate conclusions."
>
> — same page, read 2026-08-26.

**Why 7-day click matters for Luvley specifically:** the signup chain is landing →
`/app/` → Google redirect sign-in → email verification → starter-credit grant. A
1-day click window would under-report a conversion that finishes the next morning.
7-day click / 1-day view is Meta's default and is the right setting here.

---

## 8. What cannot be changed after creation

**[UNVERIFIED] — no primary source found on 2026-08-26.** It is widely held that a
campaign's `objective` is immutable and that changing it means a new campaign.
Plausible and consistent with how Ads Manager behaves, but **not sourced here**,
so do not assert it to the founder as a Meta rule. If you need the answer, the
cheapest test is to attempt the edit on a paused entity and read the error.

**What *is* documented** is the adjacent and more actionable question — which edits
reset learning, and that list is exact:
[`DELIVERY.md` §4](DELIVERY.md). For most decisions ("can I change this without
paying for it?") that list, not an immutability list, is the one you want.

**The one structural change that genuinely requires a new ad set** is switching the
optimisation event, because it is a significant edit by name. Building a second ad
set and pausing the first costs the same learning reset and preserves the first
ad set's history for comparison — see
[`OPERATING-PLAYBOOK.md` §6](OPERATING-PLAYBOOK.md).
