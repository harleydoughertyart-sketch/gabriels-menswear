# The API and MCP layer — and how to fetch a Meta doc

Tier markers are defined in [`SKILL.md`](SKILL.md).

---

## 1. The standing rule: account facts are READ, never remembered

**Before asserting anything about ad account `976311594106108` — call the tool.**

This is the rule the whole skill exists to enforce. On 2026-08-13 a report recorded
"no Luvley Facebook Page exists". On 2026-08-26 that was repeated as current, and
the founder had already made one. The observation was fine. Repeating it without
re-reading was not.

| The question | The tool |
| --- | --- |
| Is the account live, funded, what currency/timezone, what has it spent, is there a spend cap? | `ads_get_ad_accounts` |
| **Is there a Page, and what is its `page_id`?** | `ads_get_ad_account_pages` |
| What campaigns / ad sets / ads exist, and what state are they in? | `ads_get_ad_entities` (pass the `level`) |
| Which pixel/dataset, is it active, when did browser and server last fire, what events and how many? | `ads_get_datasets`, `ads_get_dataset_details` |
| Any custom conversions or event rules? | `ads_get_customconversions` |
| Is anything blocking delivery right now? | `ads_get_errors` |
| What does this ad actually look like? | `ads_get_ad_preview` |
| Is there a linked Instagram account? | `ads_get_ig_accounts` |

**Three traps in reading this account specifically:**

1. **`ads_get_errors` returning `{}` is not proof of health.** An empty result is
   also what a broken payment method or a stale spend cap returns. Meta surfaces
   those as *silence*, not as an error.
2. **Archived campaigns are invisible to default listings.** 18 exist on this
   account. If you need to know whether a name collides, filter for
   archived/deleted explicitly.
3. **Some tools are not rolled out for this account.** `ads_get_ig_accounts` and
   the activity log have both returned a "gradually rolling out" error. **That is
   *unreadable*, not *absent*** — do not report an unreadable asset as a missing
   one. That distinction is exactly the error this skill exists to prevent.

**[LIVE] status, 2026-08-26: no `ads_*` tool was reachable in the session that
wrote these files.** So nothing in [`ACCOUNT.md`](ACCOUNT.md) is verified-live.
If the MCP is not connected in your session either, say that rather than filling
the gap from the docs.

---

## 2. How to fetch a Meta doc — two surfaces, two techniques

Discovered the hard way on 2026-08-26. Worth caching because the failure is silent:
`WebFetch` on a help-centre page returns the page *title* and nothing else, which
reads like "the page has no content" rather than "you used the wrong tool".

### developers.facebook.com — append `.md`

**Every developer doc has an agent-readable Markdown twin.** Take the doc URL and
append `.md`:

```
https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/overview/bid-strategy.md
```

`WebFetch` reads these directly. This is the fastest route to any Marketing API or
Conversions API fact.

**Indexes**, all live and confirmed 2026-08-26:

| Index | Covers |
| --- | --- |
| <https://developers.facebook.com/llms.txt> | Top-level fan-out to every other index |
| <https://developers.facebook.com/documentation/ads-commerce/llms.txt> | **The big one** — Marketing API, Conversions API, catalog, Ads CLI, Ads MCP Server. ~89 KB of titled links. |
| <https://developers.facebook.com/documentation/ads-commerce/marketing-api/reference/llms.txt> | Marketing API object reference |
| <https://developers.facebook.com/documentation/mcp/llms.txt> | Meta's own MCP servers |

**Honest limitation, and it is the important part:** `llms.txt` indexes
**developer/API documentation only**. There is nothing in it about delivery
strategy, the learning phase, creative volume, placements guidance or anything else
an advertiser would call "how Meta ads work". For that you need the help centre,
which is a different technique.

### facebook.com/business/help/* — client-rendered, needs a browser

**`WebFetch` cannot read these.** They render client-side; you get the `<title>`
and nothing else.

`facebook.com/business/news/*` **does** work with `WebFetch` — Meta's marketing
posts are server-rendered. So the split is: `/news/` fetches, `/help/` does not.

**Use Playwright for `/help/`.** It is already installed under `client/`. A minimal
scraper (write it to a scratch path outside the worktree, per `AGENTS.md`):

```js
import { createRequire } from 'node:module';
const require = createRequire('<repo>/client/package.json'); // resolve from client/
const { chromium } = require('playwright');

const browser = await chromium.launch();
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
             '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  locale: 'en-US',
  viewport: { width: 1280, height: 2400 },
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(4500);            // the body renders after DOMContentLoaded
console.log(await page.evaluate(() => document.body.innerText));
await browser.close();
```

**`createRequire` pointed at `client/package.json` is load-bearing** — an ESM
script outside the worktree resolves `playwright` relative to its own location and
fails with `ERR_MODULE_NOT_FOUND` otherwise.

**Finding the right help URL:** help pages carry a "More in this section" nav whose
`<a href>`s are the whole topic tree. Scrape the links off any one page and you get
the rest. Starting point:
<https://www.facebook.com/business/help/112167992830700> (*About the learning
phase*) — its nav lists delivery, auctions, placements, pacing, attribution,
learning phase, learning limited, performance goals, ad volume, ad limits, creative
fatigue, fluctuations, ad relevance diagnostics and auction overlap.

**A 404 on a guessed help URL returns ~1,681 characters** and a 404 on the Ads
Guide returns ~3,095. If a scrape comes back at exactly one of those lengths, the
URL is wrong — do not read the marketing boilerplate as content.

---

## 3. The create sequence

Dependency order, which is what actually constrains it: campaign → ad set needs
`campaign_id`; images → creatives need `image_hash`; ads need both `adset_id` and
`creative_id`.

| # | Call | Notes |
| --- | --- | --- |
| 0 | Every read in §1 | **Before any write.** Especially `page_id` and the spend cap. |
| 1 | `ads_create_campaign` | Returns `campaign_id` |
| 2 | `ads_creative_upload_image` × N | Meta's `/adimages` returns `{images:{<filename>:{hash,url}}}` — collect the **`hash`** per file |
| 3 | `ads_create_creative` × N | Needs `page_id`, `image_hash`, the destination URL, and the opt-outs. Returns `creative_id` |
| 4 | `ads_create_ad_set` × 1 | Needs `campaign_id`. Returns `adset_id` |
| 5 | `ads_create_ad` × N | `{ name, adset_id, creative: { creative_id }, status: "PAUSED" }` |
| 6 | `ads_get_ad_preview` × N | Look at **every** one. `DESKTOP_FEED_STANDARD`, `MOBILE_FEED_STANDARD`, `INSTAGRAM_STANDARD` |
| 7 | `ads_get_errors` | Expect `{}` — and remember §1 trap 1 |

**Build everything `PAUSED`.** Unpausing is the founder's call, always.

---

## 4. Field names that matter

These are **Marketing API** field names. The MCP wraps them; whether a given MCP
tool exposes a given field is **[UNVERIFIED]** and must be checked against the
tool's own schema.

**Ad set — the fields that decide delivery:**

| Field | Notes |
| --- | --- |
| `daily_budget` / `lifetime_budget` | Minor units (cents). At campaign level instead → Advantage campaign budget |
| `optimization_goal` | e.g. `OFFSITE_CONVERSIONS`. This is what Meta bids on |
| `billing_event` | `IMPRESSIONS` is the normal pairing with `OFFSITE_CONVERSIONS` |
| `promoted_object` | `{ pixel_id, custom_event_type }` — names the optimisation event |
| `destination_type` | e.g. `WEBSITE` |
| `bid_strategy` | The four enums, [`CAMPAIGN-STRUCTURE.md` §3](CAMPAIGN-STRUCTURE.md) |
| `attribution_spec` | `[{event_type:"CLICK_THROUGH",window_days:7},{event_type:"VIEW_THROUGH",window_days:1}]` |
| `targeting` | Includes `geo_locations`, `age_min`/`age_max`, `genders`, and the placement fields |
| `targeting_automation` | `{ advantage_audience: 1 }` for Advantage+ audience |
| `start_time` / `end_time` | An `end_time` makes the ad set stop itself |
| `excluded_custom_audiences` | `[{ id: "..." }]` |

**Creative — the opt-outs:** `degrees_of_freedom_spec.creative_features_spec.<key>.enroll_status = "OPT_OUT"`.
Full key list at [`CREATIVE.md` §3](CREATIVE.md).

**Two that silently break things:**

- **`url_tags` must be unset** when the destination URL already carries UTMs. Meta
  appends `url_tags` to the link, so setting both produces duplicated or conflicting
  parameters.
- **`special_ad_categories` is required** and must be sent explicitly, as an array
  — `[]` for a normal campaign. An omitted field is a validation error on most API
  versions.

**[UNVERIFIED] and worth checking on first use:** whether `spend_cap` takes minor
units or dollars; whether the MCP exposes `degrees_of_freedom_spec`,
`promoted_object`, `attribution_spec` and `targeting_automation` at all; whether
`ads_creative_upload_image` takes a local path, bytes or a URL; and which Graph API
version the MCP targets (ODAX objective enums require v13+).

---

## 5. Reference URLs worth keeping

All confirmed live 2026-08-26. Append nothing — these already end in `.md`.

**Bidding and budget**
- Bid strategies — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/overview/bid-strategy.md>
- Budgets — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/overview/budgets.md>
- Billing events — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/overview/billing-events.md>
- Pacing and scheduling — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/overview/pacing-and-scheduling.md>
- Advantage campaign budget — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/guides/advantage-campaign-budget.md>

**Targeting**
- Placement targeting — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/audiences/reference/placement-targeting.md>
- Basic / advanced / detailed targeting — same directory, `basic-targeting.md`, `advanced-targeting.md`, `detailed-targeting.md`
- Special ad category — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/audiences/special-ad-category.md>

**Creative**
- Advantage+ creative get-started (the opt-out spec) — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/creative/advantage-creative/get-started.md>
- Asset feed spec — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-creative/asset-feed-spec.md>
- Placement asset customization — <https://developers.facebook.com/documentation/ads-commerce/marketing-api/dynamic-creative/placement-asset-customization.md>

**Measurement**
- Conversions API overview — <https://developers.facebook.com/documentation/ads-commerce/conversions-api.md>
- Handling duplicate events — <https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events.md>
- Customer information parameters — <https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/customer-information-parameters.md>
- Dataset Quality API — <https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api.md>

**Ads MCP Server** *(Meta's own docs about it — note the "Available tools" page
returned an empty body on 2026-08-26; the tool inventory in §1 comes from the
repo's own usage, not from Meta)*
- Overview — <https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-overview.md>
- Get started — <https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started.md>
- Available tools — <https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools.md>

**Ad rules engine** (automated pause/scale rules, if that ever comes up)
- <https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-rules.md>
