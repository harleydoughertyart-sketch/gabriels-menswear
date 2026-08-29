# Operating playbook — it is running and something looks wrong

**Start here mid-flight.** Each entry: what to check, which call answers it, what
the platform actually does, and what NOT to do. Every platform claim is sourced in
the file it comes from; follow the link rather than trusting the summary.

**Before any of this: read the account.** Nothing below is answerable from a file.
See [`MARKETING-API.md` §1](MARKETING-API.md).

---

## 0. The three questions to ask before touching anything

1. **Is the ad set still in the learning phase?** Check the Delivery column, and
   the `Last significant edit` column. If it reads `Learning` or `Learning limited`,
   Meta's own position is that "your results aren't necessarily indicative of
   future performance" ([`DELIVERY.md` §4](DELIVERY.md)). Most mid-flight panic is
   about numbers that are not yet numbers.
2. **Would the change I am about to make be a *significant edit*?** The list is
   exact ([`DELIVERY.md` §4](DELIVERY.md)). If yes, you are paying a full learning
   reset for it — that is a price, not a side effect.
3. **Am I looking at a breakdown?** Hourly, per-placement and per-ad breakdowns
   oscillate and average out. Meta says so explicitly
   ([`DELIVERY.md` §5](DELIVERY.md)). Read the ad set total over a full week first.

---

## 1. "Day 4, CPC is $1.80. Do I change something?"

**Worked end to end, because this is the shape of most of the questions.**

**Step 1 — is it even judgeable yet?**
Read `ads_get_ad_entities` at ad-set level for the Delivery status and the date of
the last significant edit. If the ad set is inside 7 days of that date it is in
learning, and Meta's guidance is *"Wait to edit your ad set until it's out of the
learning phase"* — with the reason stated: *"By editing an ad, ad set or campaign
during the learning phase, you reset learning and delay our delivery system's
ability to optimize."* (*About the learning phase*,
<https://www.facebook.com/business/help/112167992830700>, read 2026-08-26.)

**On a 14-day run, day 4 is inside the learning window by construction.** Day 7-8 is
the earliest honest read.

**Step 2 — is CPC even the right metric?**
Only if the optimisation goal is link clicks. If it is `OFFSITE_CONVERSIONS`, Meta
is explicit that a cost metric you did not optimise for is a poor indicator,
because "the system may go after impressions with a higher cost, if that's how we
can achieve lower conversion prices" ([`DELIVERY.md` §5](DELIVERY.md)). Pull the
**cost per optimisation event** column instead — it is the only number the auction
was steering toward.

**Step 3 — is $1.80 actually off?**
Against what baseline? For Luvley the prior is $0.54 lifetime CPC — but that is
Alura-era, a different brand, 2025 (`ACCOUNT.md`). The build spec's own budgeting
assumption is **$0.75–1.25**, and it says a new Page pays an early quality-ranking
premium. So $1.80 is ~45% above the top of the planned band, not 3x the historical
one.

**Step 4 — is anything obviously wrong rather than merely expensive?**
- `ads_get_errors` — and remember `{}` is also what a broken payment method returns.
- Delivery status: `Learning limited` names its own cause (small audience, low
  budget, low bid/cost control, high auction overlap, infrequent optimisation
  event, too many ads — [`DELIVERY.md` §4](DELIVERY.md)).
- Frequency and any `Creative limited` / `Creative fatigue` status
  ([`CREATIVE.md` §4](CREATIVE.md)).

**Step 5 — the answer.**
On day 4, in learning, with a working tracking chain: **change nothing.** Say why
in one line — "day 4 is inside the learning window, and any edit restarts it" —
and give the date of the first honest read.

**The one exception:** if the tracking chain is broken (the optimisation event is
not arriving at all), the ad set is optimising against nothing and every day of
spend is wasted. Fixing that is worth the reset. Check
`ads_get_dataset_details` → `last_fired_time` before concluding it is fine.

---

## 2. "It's working. Should I raise the budget?"

**What the platform does.** A budget change is on Meta's *may-or-may-not* list —
significance depends on magnitude. Meta's own example: $100 → $101 is unlikely to
reset; $100 → $1000 may ([`DELIVERY.md` §4](DELIVERY.md)).

**What Meta warns about**, and it is the counter-intuitive half:

> "Your cost per result may increase because your budget is significantly higher
> than usual. We will leverage your budget in the ad auction to capture as many
> opportunities for the lowest cost first. **We will then move on to more costly
> opportunities.** This may be a temporary or sustained increase; **be sure to let
> your campaign exit the learning phase before making changes.**"
>
> — Meta, *Best practices to potentially reduce cost per result*,
> <https://www.facebook.com/business/help/321695409726523>, read 2026-08-26.

**So:** raising the budget raises the cost per result *by design*, because you are
buying further down the opportunity curve. That is not a regression.

**Do:** wait until it is out of learning; raise in increments small enough not to
trip the magnitude threshold; expect cost per result to rise and judge the *volume*
you bought with it.

**Do not:** raise the budget to fix a `Learning limited` ad set mid-learning. It is
one of Meta's listed fixes, but the fix and the reset arrive together — decide
knowingly.

**Also:** daily budget is an average that flexes up to +75% on a day and caps at 7×
weekly ([`DELIVERY.md` §5](DELIVERY.md)). Do not "raise the budget" because one day
overspent.

---

## 3. "Why is one ad taking all the delivery?"

**Because that is the design.** Quoted in full at
[`DELIVERY.md` §1](DELIVERY.md):

> "we'll show the ad that's most likely to achieve the lowest cost per optimization
> event for the given person. This means that each of your ads won't necessarily be
> delivered the same number of times."

**What to tell the founder:** this is Meta working, not Meta ignoring the other
ads. The cost is that the under-delivered ads are **unjudged, not beaten** — you
learn which one won, not which ones lost.

**What NOT to do:** do not "even it out" by splitting the losers into their own ad
set. That fragments the audience and doubles the learning-phase bar
([`DELIVERY.md` §6](DELIVERY.md)), and your own ads still will not bid against each
other — auction overlap picks one anyway ([`DELIVERY.md` §2](DELIVERY.md)).

**When it is genuinely a problem:** if you specifically need a ranked creative
readout, that requires a **split test / A/B test** with forced even delivery, which
is a different product from an ad set, and it costs a lot more per creative. Say
that plainly rather than approximating it inside one ad set.

---

## 4. "This ad died. Swap it or leave it?"

**Check the Delivery status first.** `Creative limited` means cost per result is up
but under 2x; `Creative fatigue` means ≥2x. Meta's thresholds, quoted at
[`CREATIVE.md` §4](CREATIVE.md).

**Meta's own recommendation is counter-intuitive and worth quoting to the founder:**

> "Create a new ad with a new image or video that is materially different from the
> original creative. Note: **Keeping your original ad active instead of pausing or
> turning it off may maximize results.**"
>
> — Meta, *About creative fatigue recommendations*, read 2026-08-26.

**The cost of the swap:** "Adding a new ad to your ad set" is a **significant edit**
and resets learning ([`DELIVERY.md` §4](DELIVERY.md)). Pausing an individual ad is
not on that list.

**So the decision tree:**

- **Late in a short run** (last ~4 days of 14): do nothing. A reset now means the
  run ends in learning and produces no readable number at all.
- **Early, and the ad set has other live creatives:** pause the dead one. That is
  the cheap move and it is not a documented reset.
- **Early, and it was the only creative carrying delivery:** adding a replacement
  is worth the reset — but understand you are restarting the 7-day clock, and say
  so.
- **Fatigue with only one creative in the ad set:** expanding the audience is the
  fix Meta lists that is *not* a significant edit at ad level… except that "any
  change to targeting" **is** on the significant-edit list. There is no free move
  here. Say so rather than implying one exists.

---

## 5. "Nothing is delivering."

Check in this order, cheapest first:

1. **`ads_get_errors`.** `{}` is not proof of health — a stale account spend cap or
   a dead card reads as silence ([`MARKETING-API.md` §1](MARKETING-API.md)).
2. **The account's `spend_cap` and `amount_spent`** via `ads_get_ad_accounts`. This
   account has $1,638.96 of history; a cap set in the Alura era would halt delivery
   on day one with no error surface.
3. **Is anything actually unpaused?** Campaign, ad set and ad each have their own
   status. All three must be active.
4. **`start_time`.** A start time in the future delivers nothing and reports
   nothing.
5. **Auction overlap** — if another ad set of yours shares the audience, yours may
   be losing every internal selection ([`DELIVERY.md` §2](DELIVERY.md)).
6. **Audience size.** Too narrow is a named `Learning limited` cause.
7. **Ad review.** An ad in review does not deliver; an ad rejected does not deliver
   and does say so.

---

## 6. "When do I switch the optimisation event?"

**The test is arithmetic, and there are two of them. Run both.**

- **Volume:** is the target event plausibly clearing **~50 per week** at current
  spend? ([`DELIVERY.md` §4](DELIVERY.md))
- **Budget:** is the daily budget at least **10× the cost of that event**? Meta's
  own rule ([`DELIVERY.md` §5](DELIVERY.md)).

**If either fails, do not switch.** An ad set optimising for an event it cannot
generate 50 of stays in learning, delivers more expensively, and reports a CPA that
is noise.

**How to switch when both pass:** *"Any change to optimization event"* is a
significant edit, so there is no cheap version. Build a **new ad set** and pause the
old one. Same reset cost, and it preserves the first ad set's history for
comparison — an edit destroys that.

**The Luvley-specific fork, and it is already resolved in the repo.** The go-report
locks `CompleteRegistration` in its §2b and overturns itself in its own corrections
section at the top of the same file. `CAMPAIGN-BUILD-SPEC.md` §3 resolves it as
**`ViewContent` first, `CompleteRegistration` at ~50/week**, on three grounds: the
volume arithmetic; that `CompleteRegistration` has never fired in production
(cause fixed 2026-08-25, not yet observed firing under real traffic); and that
`ViewContent` already fires on the exact destination. Both docs are dated in
[`ACCOUNT.md`](ACCOUNT.md).

---

## 7. "Should I exclude a placement?"

**Meta's answer is usually no, and it publishes the arithmetic** — the
11-opportunity worked example showing that turning off the "expensive" placement
produced *fewer* results at a *higher* blended cost
([`DELIVERY.md` §7](DELIVERY.md)).

**What per-placement cost does not tell you:** whether that placement is
inefficient. Meta says this in as many words.

**The legitimate reason to exclude one** is not cost — it is that the creative is
wrong for the surface. And the honest state of that argument for Luvley's statics
in Reels/Stories is **[UNVERIFIED]** ([`CREATIVE.md` §6](CREATIVE.md)): the
auto-fit mechanism is real, the performance penalty is not sourced.

**The cheap resolution:** turn `adapt_to_placement` and `image_uncrop` **off**, and
supply per-placement assets if you want the surface. Then the question is about
inventory, not mangled artwork.

**If you do run a placement comparison:** it needs a **second, independently funded
ad set** — which means ABO, not Advantage campaign budget, or Meta reallocates the
budget toward the early winner and the comparison is gone
([`CAMPAIGN-STRUCTURE.md` §4](CAMPAIGN-STRUCTURE.md)).

---

## 8. "Spend was $87 yesterday on a $50/day budget."

**In spec.** Meta may spend "up to 75% over your daily budget on some days and less
on others", capped at 7× daily on a weekly basis
([`DELIVERY.md` §5](DELIVERY.md)). $87 is 74% over.

**What to check instead:** the 7-day total against 7 × daily. If *that* is over,
something else is happening and it is worth a look.

**Note the rollout wording** — Meta says this is being "gradually introduced to
some Meta Ads Manager accounts", so whether it applies to `976311594106108` is
**[LIVE]**. Read it.

---

## 9. "Meta says 40 signups, our dashboard says 27."

**Do not reach for "attribution windows" first.** Meta publishes five distinct
reasons and most of the time it is one of the earlier ones — unique-visitor
counting, opted-out users, sessions vs visitors, or differing measurement
timeframes. All five are quoted at [`MEASUREMENT.md` §4](MEASUREMENT.md), along
with Meta's own worked example where three legitimate counts of the same traffic
span ~50x.

**Then check the Luvley-specific pair**, in this order:

1. **Consent.** Meta events fire only on an explicit advertising grant, failing
   closed to `unknown`. This is a straight multiplier on everything Meta sees and
   it is currently **unmeasured** ([`MEASUREMENT.md` §5](MEASUREMENT.md)).
2. **Deduplication.** If CAPI woke up under paid traffic with mismatched
   `event_id`, Meta double-counts silently ([`MEASUREMENT.md` §2](MEASUREMENT.md)).
   That is the failure mode that inflates Meta's number specifically.

**And the join:** the ops dashboard matches spend to signups on `utm_campaign`
alone. A one-character mismatch between the ad URL and `META_ADS_CAMPAIGN_UTM`
produces a confidently wrong CAC with no error
([`MEASUREMENT.md` §8](MEASUREMENT.md)).

---

## 10. "Is this campaign working?"

**Answer against what the test can actually conclude**, not against what would be
nice to know. The list of both is [`DELIVERY.md` §8](DELIVERY.md).

**The three numbers worth reporting from a small first campaign:**

1. **Cost per optimisation event**, ad-set total, over a full week, scoped to the
   new campaign id — not the account, which blends $1,638.96 of 2025 spend across
   two businesses.
2. **Whether the chain fired end to end** — landing → event → CAPI → dashboard.
   On a first campaign this is usually the more valuable finding.
3. **Audience pool built.** For an account whose custom audiences hold ~20 people,
   filling them is the most reliable deliverable the spend produces.

**And one sentence of honesty about the creative:** "N winners, M unjudged" — never
a ranked list of all of them.
