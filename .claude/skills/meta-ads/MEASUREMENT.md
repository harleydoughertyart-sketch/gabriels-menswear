# Measurement — pixel, CAPI, and why nothing agrees with anything

Tier markers are defined in [`SKILL.md`](SKILL.md). "Read 2026-08-26" means the
page was fetched that day and quoted from.

---

## 1. Two pipes into one dataset

A Meta **dataset** (still called a pixel almost everywhere, including by Meta) is
fed by two independent channels:

- **Browser** — `fbq(...)` from the page. Blocked by ad blockers, ITP, consent
  refusal, and in-app browsers that mangle the URL.
- **Conversions API (CAPI)** — server-to-server, one event per request to
  `POST {graphOrigin}/{graphVersion}/{datasetId}/events`.

They are not alternatives. Meta expects both, and expects you to tell it when the
same event arrived twice.

**Luvley's shape** (from `docs/launch/META-MEASUREMENT-PREPARATION.md`, dated in
`ACCOUNT.md`): dataset `2044971569526545`, browser id shipped as
`VITE_META_PIXEL_ID`, server token as `META_CAPI_ACCESS_TOKEN` from Secret Manager,
never plaintext. The browser adapter uses `trackSingle` against the configured
pixel id.

---

## 2. Deduplication — the exact contract

> **[MECHANIC]** "Meta employs matching logic based on event identifiers and user
> information. When identical events arrive through both channels, **we generally
> prefer the event that is received first**."
>
> — Meta for Developers, *Handling Duplicate Events*,
> <https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events.md>,
> read 2026-08-26.

**Method 1 (Meta's recommended one):** the Pixel's `eventID` must match the
Conversions API's `event_id`, **and** the pixel's `event` must match the API's
`event_name`. Both, not either.

**Method 2 (fallback):** `event_name` plus `fbp` and/or `external_id`. It carries a
named limitation, quoted:

> "Server events will **not** be discarded if a browser event has not been received
> in the past 48 hours" — even with identical information.

**The window:** events are deduplicated only "if they are received within **48
hours** of when we receive the first event with a given `event_id`."

**And the case where none of this applies:** "advertisers who do not send the same
event twice via both the Conversions API and Meta Pixel do not need to set up
deduplication for those events."

### The inverted risk to watch for at Luvley

The browser side already emits the dedup key — `leadTracking.ts:57` uses
`fbq('trackSingle', pixelId, 'Lead', {}, { eventID })`, same pattern at
`registrationTracking.ts:86` (per `docs/launch/CANARY-GO-REPORT.md`, 2026-08-13).
CAPI has fired 3 server events lifetime, all in one hour on 2026-07-28 — a single
manual QA pass.

**So dedup is un-measurable, not broken, and the risk runs backwards:** if CAPI
wakes up under paid traffic and its `event_id` does *not* match the browser's, Meta
counts every conversion twice, silently, with no error anywhere. **First 48 hours
of any real campaign: check a known-good event in Events Manager and confirm it
shows as deduplicated, not as two.**

---

## 3. Event match quality

**[UNVERIFIED] as to thresholds.** Meta computes an EMQ score per event from the
customer-information parameters you send (email, phone, `fbp`, `fbc`,
`external_id`, IP, user agent). No primary source for what score is "good" was read
on 2026-08-26.

**What is known and dated for Luvley:** EMQ returned `{"web":[]}` — empty, not bad.
287 lifetime events is below the volume Meta needs to compute a score at all
(`CANARY-GO-REPORT.md`, 2026-08-13). Expect a score to appear once paid traffic
starts, and read it then rather than predicting it.

The parameter reference, if you need to improve it:
<https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters.md>
and `fbp`/`fbc` at
<https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc.md>.

---

## 4. Why the numbers disagree — Meta's own explanation

This is the question that gets asked most and answered worst. Meta publishes the
reasons; here they are, quoted, so you never have to guess.

> **[MECHANIC]** "**Pixel fires aren't equal to unique visitors.** A single visitor may
> fire multiple pixel events, but the visitor will only be counted one time. This
> is also true when a unique visitor engages in multiple events (such as adding an
> item to a cart, adding payment information and purchasing) or if a web page has a
> pixel installed multiple times."
>
> — Meta, *Troubleshoot website custom audience size*,
> <https://www.facebook.com/business/help/237515166435276>, read 2026-08-26.

> **[MECHANIC]** "**Website visitors must also be Meta technologies users** for their
> visits to count. However, we don't include accounts that have opted out of online
> behavioral advertising." — same page.

> **[MECHANIC]** "**Sessions vs. visitors:** Third-party analytics tools may count
> unique sessions rather than unique visitors. For example, a single visitor may
> view your website first on their phone and then on their desktop computer. That
> would be two unique sessions, but only one unique visitor. This is also true if a
> single user erases cookies or refreshes a page." — same page.

> **[MECHANIC]** "**Measurement timeframes:** Meta technologies tools count all the
> time, whereas third-party analytics may count unique visitors and sessions using
> different periods of time." — same page.

> **[MECHANIC]** "Remember that each system has its own measurement system and **you
> may notice discrepancies between them. You shouldn't expect numbers to perfectly
> line up between different platforms.**" — same page.

Meta's own worked example of the magnitude, same page: 20,000 third-party
"visitors" × 7 pages ≈ 140,000 pixel fires, against a custom audience of ≈ 2,857
unique visitors. **A ~50x spread between three numbers that all describe the same
traffic.**

**Add to that, from the attribution page:** results cannot be compared across ad
sets using different attribution models
([`CAMPAIGN-STRUCTURE.md` §7](CAMPAIGN-STRUCTURE.md)).

**And from the fluctuations page:** when optimising for conversions, CPM is not a
performance indicator, because the system will deliberately buy more expensive
impressions if that lowers conversion cost
([`DELIVERY.md` §5](DELIVERY.md)).

**How to answer "why does Meta say 40 and GA4 say 27?"** Name which of the five
above applies, rather than reaching for "attribution windows" as a catch-all. Most
of the time it is unique-visitor counting or an opted-out cohort, not attribution.

---

## 5. Consent — the multiplier nobody measures

**This is repo-side, not Meta-side, and it is the largest single threat to any
Luvley campaign's measurability.**

Meta events fire only on an explicit **advertising** grant, and consent **fails
closed to `unknown`**. With no banner interaction at all there are zero tag
requests, `fbq` is undefined, and no cookies are set
(`docs/launch/CANARY-GO-REPORT.md:481-484`, 2026-08-13).

**The arithmetic:** if the optimisation event fires on the landing page, banner
acceptance is a straight multiplier on the event rate Meta sees. At 50% acceptance
the ad set optimises on half the events it thinks it is bidding for. Below roughly
30%, a $50/day ad set cannot approach the ~50-events-per-week threshold on *any*
event.

The US geo-default that would change this is `docs/launch/CONSENT-GEO-DEFAULT.md`,
status **investigation only, nothing implemented** as of 2026-08-26.

**Two operational rules that follow:**

1. **Measure banner acceptance in the first 48 hours of any campaign.** It is an
   input to every other number and it is currently unknown.
2. **Answer the banner before judging any page.** This is already repo law in
   `AGENTS.md` — a measurement taken with the banner up measures a state that lasts
   one tap. `client/tests/e2e/deny-marketing-consent.ts` must be called **before**
   `page.goto`.

---

## 6. Aggregated Event Measurement

**[UNVERIFIED].** The repo carries the standing claim that iOS 14.5+ attribution
requires the 8 web-event priorities to be configured, and that "events outside the
top 8 are dropped with no error anywhere"
(`CANARY-GO-REPORT.md`, 2026-08-13). **No Meta primary source was read for this on
2026-08-26.**

What the attribution page *does* say, and it is the only sourced adjacent fact:
iOS 14+ app campaigns "using Meta's attribution, also known as **Aggregated Event
Measurement**, […] report using 1-day attribution, depending on the attribution
setting you chose in Ads Manager" (*About attribution models and attribution
settings*, read 2026-08-26).

Two things the repo records that are worth carrying as observations rather than
rules: AEM has been **relocated out of the dataset view** in current Events
Manager, and it typically surfaces **once a conversion campaign exists** — so the
configuration step usually comes *after* the campaign is built and before it is
unpaused (`CANARY-GO-REPORT.md:583`, 2026-08-13).

Domain verification for `luvley.ai` is done — domain id `1574453014086867`,
verified in the Luvley.ai business portfolio (`CANARY-GO-REPORT.md:565`,
2026-08-13). The MCP cannot read it, which is why it repeatedly reads as missing.

---

## 7. Custom conversions and event rules

**[LIVE] — read, never remember.** As of the last recorded read (2026-08-13):
no conversion event rules configured, no custom conversions (`total_count: 0`).

Tools: `ads_get_customconversions` for the list;
`ads_get_datasets` / `ads_get_dataset_details` for the dataset itself, its
`last_fired_time` per channel, and its event counts. See
[`MARKETING-API.md`](MARKETING-API.md).

**Why you would want one:** a custom conversion lets you optimise on a URL-matched
or parameter-matched subset of a standard event — the usual escape hatch when the
event you want to buy is too rare and the one that fires is too broad. It does not
create volume; it slices it. On a budget that is already short of the ~50/week
threshold, slicing further makes the problem worse, not better.

---

## 8. Getting spend onto the ops dashboard

Not a Meta mechanic, but it is where measurement actually lands for the founder,
and it has a documented failure mode with no error.

`docs/agents/ad-spend-sync.md` is the source of truth. The two things that decide
whether CAC is computable:

- **`META_ADS_ACCESS_TOKEN`.** Without it the sync "starts no timer at all", and
  reconciliation is a **manual daily task**; skipping a day renders every CAC
  figure as an em dash with only a weak alert (`ad-spend-sync.md:99-120`). A
  read-only **`ads_read`** system-user token is the documented preferred path
  (`ad-spend-sync.md:28-48`) — note that the file's own opening paragraph says the
  opposite and is corrected later in the same file.
- **`META_ADS_CAMPAIGN_UTM`.** It maps Meta campaign id → `utm_campaign`, and the
  dashboard joins spend to signups on `utm_campaign` **alone**. A one-character
  disagreement between the URL's `utm_campaign` and this map produces a
  confidently wrong CAC and **no error anywhere** (`ad-spend-sync.md:130-145`).

**An env-var change touches seven places in one commit.** See
`docs/agents/release-gate-coverage.md` before adding either secret.

---

## 9. UTM taxonomy — five tuples exist in the repo

**[CONTESTED] within the repo, resolved but worth knowing.** Five different
`utm_source`/`utm_medium` pairs are written down across the launch docs
(`CAMPAIGN-BUILD-SPEC.md` §6 CONTRADICTION-3, 2026-08-26). All five pass the
validator, so nothing errors — but the dashboard's Acquisition panel groups by
`utm_source`, so a mix produces split rows.

Resolved there as **`utm_source=meta` + `utm_medium=paid_social`**, with
`utm_campaign=jewelry-canary-aug`. Use those unless the founder says otherwise, and
make sure `META_ADS_CAMPAIGN_UTM` carries the identical string.

One validator rule that has caught people: **the campaign validator rejects seven
or more consecutive digits**, so never put a raw Meta id in a UTM value.
