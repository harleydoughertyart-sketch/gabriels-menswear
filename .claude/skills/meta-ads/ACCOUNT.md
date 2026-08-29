# Luvley's Meta account — every line marked

## Read this before quoting anything below

**Not one fact in this file is verified-live.** No `ads_*` tool was reachable in
the session that wrote it (2026-08-26). Every line is **from-a-doc**, with the
document and its date.

**A from-a-doc fact is a hypothesis about the present.** The failure this whole
skill exists to prevent happened exactly here: a 2026-08-13 observation ("no
Luvley Facebook Page exists") was repeated as today's truth on 2026-08-26, and the
founder had already created one and set up a campaign.

**So: call the tool, then answer.**
[`MARKETING-API.md` §1](MARKETING-API.md) maps each common question to the call
that answers it. If the MCP is not connected in your session, **say so** — "I can't
read the account right now; as of the 2026-08-13 report it was X" — rather than
reporting the doc as the state of the world.

---

## Identifiers

*Source: `docs/agents/ad-spend-sync.md`, `docs/launch/META-MEASUREMENT-PREPARATION.md`,
`docs/launch/CANARY-GO-REPORT.md` (2026-08-13),
`D:\Luvley Ad Campaign\CAMPAIGN-BUILD-SPEC.md` (2026-08-26). Ids are the most
durable class of fact here, but confirm before writing against one.*

| | Value |
| --- | --- |
| **Ad account** | **`976311594106108`** — "Luvley.ai \| Meta Ads" |
| Business portfolio | `596411759117354` |
| Currency / timezone | USD / America/New_York |
| **Pixel / dataset** | **`2044971569526545`** — "Luvley.ai \| Web + Product Events", created 2026-07-20, shared to the ad account |
| Verified domain | `luvley.ai`, domain id `1574453014086867` — **verified**, in the Luvley.ai portfolio. The MCP cannot read it, which is why it repeatedly reads as missing |
| Registered-users custom audience | `120248320098320677` |
| GA4 stream | `G-7KRKQBB54F` (live). `G-EBC99B4ND3` is a dead July stream |
| GTM container | `GTM-WGQ7DLQ4` — the only measurement id in shipped code |

**Do not use:**

| | Why |
| --- | --- |
| Ad account `1062619839131277` | "Harley Dougherty" — personal leftover, no business, no payment method, zero spend |
| Asset id `743851915424941` | A conflicting id explicitly **not** the pixel/dataset |
| Pixel `10025810140854716` | "Alura Visuals Legacy Pixel". Still fires ~5 PV/week but 100% on `www.aluravisuals.com`, zero on `luvley.ai` — ruled out as a double-tracking risk |
| The four 2025 lookalike audiences | INACTIVE, seeded from Alura *agency* traffic. Wrong audience |
| The 25+ orphaned 2025-10-27 creatives and ad images | Jewelry-B2B copy, wrong brand |

---

## Two known-stale claims — marked, not fixed

These are the two that caused the failure. **They stay in their source documents as
history. Do not edit those files; cite the correction.**

### STALE-1 — "No Luvley Facebook Page exists"

- **Claim:** `docs/launch/CANARY-GO-REPORT.md:219` and `:597` (blocker B1/A1),
  written **2026-08-13**: no Luvley Page on the user, ad account or business; only
  "Harley Dougherty", "Luxeform Gallery", "Alura Visuals".
- **Status: SUPERSEDED.** The founder confirmed on **2026-08-26** that a Luvley
  Facebook Page exists and a campaign is already set up.
- **What is still unknown:** the Page's `page_id`, whether it is assigned to ad
  account `976311594106108`, and whether Instagram is linked to it. **All [LIVE] —
  `ads_get_ad_account_pages` and `ads_get_ig_accounts`.**
- **Why it matters:** `ads_create_creative` requires a `page_id` and there is no MCP
  workaround, so this was the blocker gating the entire creative build.

### STALE-2 — "3-4 statics; above ~5 is noise"

- **Claim:** `docs/launch/CANARY-GO-REPORT.md:635-636`, **2026-08-13**: *"3-4
  statics. Below 3 nothing is comparable; above ~5 each creative gets too few
  clicks for CTR differences to separate from noise."*
- **Status: OVERTURNED by the founder, 2026-08-26.** Recorded at
  `D:\Luvley Ad Campaign\CAMPAIGN-BUILD-SPEC.md` §4.1, which resolves to loading
  his full picked set at launch — cards 21, 22, 23, 24, 25, 27, 28, 29, 36, 37, 38,
  41, 42, 44, 48, 51 — and letting Meta select.
- **Why the original was wrong:** it modelled delivery as an equal split. Meta's own
  *About ad delivery* page says the opposite in as many words
  ([`DELIVERY.md` §1](DELIVERY.md)).
- **What is genuinely lost, and it is smaller than the original claim:** attribution,
  not delivery. The readout becomes "N winners and M unknowns", not a ranked list.
- **What remains genuinely contested:** whether 16 ads in one ad set is on the wrong
  side of Meta's *own* ad-volume guidance, which is a separate argument from the
  equal-split one. Both sides quoted at [`CREATIVE.md` §1](CREATIVE.md). **Do not
  present "more creative is always better" as settled either.**

---

## Historical performance — a prior, not a guarantee

*Source: `CANARY-GO-REPORT.md`, 2026-08-13.*

| | |
| --- | --- |
| Lifetime spend | $1,638.96 |
| Impressions / clicks / reach | 95,765 / 3,047 / 54,394 |
| CPM / CPC / CTR | $17.11 / **$0.54** / 3.18% |
| Period and brand | Mar–Oct 2025, under **Alura Visuals**, jewelry-seller audience, mostly static |

**Two cautions the report attaches to its own number:** a new Page pays an early
quality-ranking premium, so budget against **$0.75–1.25 CPC**; and account-level
aggregates blend that $1,638.96 across two businesses and 11 months, so **scope
every report to the new campaign id**.

**Account vertical is misclassified** as *Advertising and Marketing → Full-Service
Agency*, inherited from the Alura era. Every benchmark Meta returns comes from an
agency peer group, not software. Worth fixing; not a blocker.

---

## Pixel state as last read (2026-08-13) — expect all of this to have moved

| Event | 28 days | 7 days |
| --- | --- | --- |
| PageView | 210 | 54 |
| ViewContent | 71 | 16 |
| Lead | 3 | 0 |
| CompleteRegistration | 3 | 0 |
| **Purchase** | **0 — never fired, ever** | 0 |
| Total | 287 (284 browser / **3 server**) | 70 (0 server) |

- **CAPI dormant.** 3 server events lifetime, all in one hour on 2026-07-28 = a
  single manual QA pass. 1.05% server coverage.
- **EMQ empty** (`{"web":[]}`) — below the volume Meta needs to compute one.
- **No custom conversions, no conversion event rules** (`total_count: 0`).
- **`CompleteRegistration` had never fired in production**, browser or CAPI. Cause
  was the Firebase `/__/auth/handler` referrer failing the measurement gate; fixed
  **2026-08-25** (`CANARY-TRACKING-AUDIT.md:153-198`) and **not yet observed firing
  under real traffic**.
- **`/for/jewelry` is instrumented** — ViewContent with
  `content_name: luvley_landing_jewelry`
  (`marketing/src/metaMeasurement/pixelAdapter.ts`, asserted
  `pixelAdapter.test.ts:71`), and a second ViewContent on the hero CTA click as
  `luvley_cta_landing_hero`. An engaged session produces two — expect that rather
  than reading it as a duplicate.

**Read it now with `ads_get_dataset_details`.** `last_fired_time` per channel is
the single most informative field.

---

## Audiences

Three correctly-built Luvley audiences (all-visitors / registered / pricing-viewers,
180-day, bound to pixel `2044971569526545`) — **~20 people each** as of 2026-08-13,
consistent with 287 lifetime events.

**Filling this pool is the canary's most reliable deliverable.**

On the size question: the go-report calls ~20 "far below Meta's 1,000 targeting
floor". **Meta's own current guidance says "several hundred", not 1,000** — see
[`CAMPAIGN-STRUCTURE.md` §6](CAMPAIGN-STRUCTURE.md), where both are quoted with
dates. Academic at 20 people; not academic the next time someone plans a
retargeting ad set.

---

## Campaign parameters the founder has locked

*Source: `CANARY-GO-REPORT.md` (2026-08-13) and `CAMPAIGN-BUILD-SPEC.md` §10
(2026-08-26). Locked means locked — do not re-derive, and do not quietly relax one
to make an arithmetic problem go away.*

| | |
| --- | --- |
| Budget | **$700 total = $50/day × 14 days.** If cost must be cut, **cut creative count — never the daily rate or the duration** |
| Destination | `https://luvley.ai/for/jewelry`, then into the app |
| Targeting | US, ages **25–64**, gender omitted (= all) |
| Profit bar | LTV:CAC **2:1** target; 1:1 acceptable at first purchase |
| Everything is built | **PAUSED.** Unpausing is the founder's click |
| Optimise for | **Lead** → superseded. See the resolved position below |
| Campaign spend cap | $750, as a guardrail in Meta rather than a memory |
| UTMs | `utm_source=meta`, `utm_medium=paid_social`, `utm_campaign=jewelry-canary-aug` |

**Optimisation event — resolved as `ViewContent` first, `CompleteRegistration` at
~50/week** (`CAMPAIGN-BUILD-SPEC.md` §3, 2026-08-26). The go-report locks
`CompleteRegistration` in its §2b and overturns itself in its own corrections
section at the top of the same file; the corrections section wins, and
`ADS-LAUNCH-READINESS.md:122-124` said it first. The arithmetic behind it is at
[`OPERATING-PLAYBOOK.md` §6](OPERATING-PLAYBOOK.md).

**Modelled economics — a model, not a measurement.** Gross margin $17.15/user/month
(79.8%); LTV $65 / $111 / $211 at 25% / 15% / 8% monthly churn; max CAC $47.75 /
$99.20 / $202.10 at 3 / 6 / 12-month payback; required CPC $0.85. The margins are
measured from credit pricing and provider rates. **The churn and conversion inputs
are assumptions the canary exists to replace** — there are no paying customers yet.

---

## Open blockers as last recorded — all [LIVE], all must be re-read

*From `CAMPAIGN-BUILD-SPEC.md` §0 (2026-08-26). At least one (A1) is known to have
moved since it was written.*

| # | Blocker | Status |
| --- | --- | --- |
| A1 | A Luvley Facebook Page, assigned to ad account `976311594106108` | **Believed done** — see STALE-1. Verify `page_id` and assignment |
| A2 | Card validity + **account spend cap** ($1,638.96 already spent) | Unknown. Meta reports a stale cap as *silence* — `ads_get_errors` returns `{}` either way |
| A3 | `luvley.ai` domain verification | **DONE** — id `1574453014086867`. The MCP simply cannot read it |
| A4 | The 8 Aggregated Event Measurement priorities | Unknown. Typically surfaces once a conversion campaign exists, so do it after the campaign is built and before unpausing. See [`MEASUREMENT.md` §6](MEASUREMENT.md) — this is repo lore, **[UNVERIFIED]** against Meta |
| B8 | Instagram linked to the Page | Unknown. Without it the ad set effectively runs Facebook-only |

**And the one that is not a Meta setting and is the biggest single lever:** the US
consent geo-default (`docs/launch/CONSENT-GEO-DEFAULT.md`, status *investigation
only, nothing implemented*). Meta events fire only on an explicit advertising
grant, consent fails closed to `unknown`, and the optimisation event fires on a
pageload that only counts for a visitor who pressed **Accept all**.
[`MEASUREMENT.md` §5](MEASUREMENT.md).

---

## The documents this file summarises

Read the source when the detail matters. Dates are when each was written.

| Document | Date | What it holds |
| --- | --- | --- |
| `docs/launch/CANARY-GO-REPORT.md` | 2026-08-13 | The overnight investigation. Account inventory, pixel state, the optimisation-event arithmetic, the blockers. **Contains STALE-1 and STALE-2**, and overturns itself in its own corrections section at the top |
| `D:\Luvley Ad Campaign\CAMPAIGN-BUILD-SPEC.md` | 2026-08-26 | The executable build. Field-by-field campaign/ad set/creative spec, the resolved contradictions, the MCP call sequence, the risks. **Most current** |
| `docs/launch/ADS-LAUNCH-READINESS.md` | mixed | Readiness table. Its GA4 line and its pinned production revision are **stale** (`CAMPAIGN-BUILD-SPEC.md` §6 CONTRADICTION-7) |
| `docs/launch/CANARY-TRACKING-AUDIT.md` | to 2026-08-25 | The tracking chain, event by event. Where the `CompleteRegistration` fix is recorded |
| `docs/launch/META-MEASUREMENT-PREPARATION.md` | — | Pixel/CAPI wiring, env var names, Secret Manager, the dataset ownership verification |
| `docs/agents/ad-spend-sync.md` | — | Getting spend onto the ops dashboard. **Its opening paragraph contradicts its own §2 and the later section is correct** |
| `docs/launch/CONSENT-GEO-DEFAULT.md` | — | The consent multiplier. Investigation only, nothing implemented |
| `.claude/skills/luvley-ads/LEDGER.md` | living | The founder's taste. Not platform knowledge — see [`SKILL.md`](SKILL.md) on the boundary |
