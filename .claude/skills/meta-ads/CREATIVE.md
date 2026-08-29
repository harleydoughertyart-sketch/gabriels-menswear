# Creative — volume, enhancements, specs, fatigue

Tier markers are defined in [`SKILL.md`](SKILL.md). "Read 2026-08-26" means the
page was fetched that day and quoted from.

---

## 1. How many creatives — [CONTESTED], and both sides are Meta

**This is the most important entry in this file, and the honest answer is that
Meta publishes two positions that pull in opposite directions.** Anyone who gives
you one of them as settled has read half the help centre.

### Side A — run fewer ads per ad set

> **[GUIDANCE]** "**Avoid high ad volumes.** When you create many ads and ad sets,
> the delivery system learns less about each ad and ad set than when you create
> fewer ads and ad sets. By combining similar ad sets, you also combine learnings."
>
> — Meta, *About the learning phase*,
> <https://www.facebook.com/business/help/112167992830700>, read 2026-08-26.

> **[GUIDANCE]** "When an advertiser runs **too many ads at once, each ad delivers
> less often**. This means that fewer ads exit the learning phase, and more budget
> is spent before the delivery system can optimize performance. In other words,
> **too many ads can result in worse performance.**"
>
> — Meta, *About managing ad volume*,
> <https://www.facebook.com/business/help/2720085414702598>, read 2026-08-26.

Its concrete instruction, same page:

> "**Decrease ads per ad set, but maintain diverse creative assets per ad set.**
> One ad can contain multiple (up to 10) creative assets."

And `Learning limited`'s cause list names "running too many ads at the same time"
outright (*About learning limited*,
<https://www.facebook.com/business/help/269269737396981>, read 2026-08-26).

### Side B — diversify creative, run more of it

> **[GUIDANCE]** "Creative diversification refers to the practice of creating a wide
> range of ad creatives with different themes, messages, and visuals to cater to
> diverse audience segments."
>
> — Meta for Business, *The creative advantage: unlocking the power of
> diversification with Meta Andromeda*,
> <https://www.facebook.com/business/news/the-creative-advantage-unlocking-the-power-of-diversification-with-meta-andromeda>,
> read 2026-08-26.

That post cites a customer scaling "from 3-4 new creatives a week to almost 50 on
average", and frames Andromeda as the reason the platform can now use that volume.

> **[GUIDANCE]** "Creative iteration might produce two ads with **identical visuals,
> but different text CTAs**, while creative diversification would generate two
> **distinctly different pieces of creative**."
>
> — Meta for Business, *Demystifying creative diversification*,
> <https://www.facebook.com/business/news/demystifying-creative-diversification>,
> read 2026-08-26.

Same post, on portfolio rather than count: advertisers should develop "a broad
portfolio of assets that take more creative liberty across text, image, and video."
**It does not give a number.**

### How to reconcile them without picking a side silently

The two are not as contradictory as they look, and the seam is *where* the variety
lives:

- **Side A's actual objection is to ad-object count**, because each ad object is a
  separate learning surface and adding one is a significant edit
  ([`DELIVERY.md` §4](DELIVERY.md)). Its prescription is explicit: fewer ads,
  *more assets inside each ad*.
- **Side B's actual argument is about creative variety**, and Meta's own remedies
  for delivering variety without ad-object sprawl are named on the ad-volume page:
  multiple text optimisation, flexible ad format, Advantage+ creative, asset
  customisation — "One ad with multiple text optimization is usually more effective
  than multiple ads without multiple text optimization."

**What is genuinely unresolved, and say so:** whether a 12-to-16-ad ad set on a
$50/day budget is on the good or bad side of "too many". Meta publishes no
threshold. Jon Loomer reports Meta previously suggested a six-ad ceiling and
withdrew it; that is a secondhand claim and is **[UNVERIFIED]** — no Meta page
found on 2026-08-26 names any number.

**What is settled**, and it is the part the founder was right about: delivery is
not an equal split, so the *arithmetic* against many creatives is wrong even where
the *conclusion* might survive on the learning-phase argument. See
[`DELIVERY.md` §1](DELIVERY.md).

**Note on dynamic creative**, because it changes which remedy is available:

> **[MECHANIC]** "Starting in June 2024, you may no longer be able to use dynamic
> creative when creating ad sets on Ads Manager when you select **sales or app
> promotion** as your objective. While existing campaigns leveraging dynamic
> creative will be unaffected at this time, using **flexible ad format** to achieve
> a similar result is recommended."
>
> — *About managing ad volume*, read 2026-08-26.

---

## 2. Load creatives at launch, not on day 5

Not a style preference — it falls directly out of the significant-edit list:

> **[MECHANIC]** "The following are considered significant edits: […] **Adding a new
> ad to your ad set** […]"
>
> — Meta, *Significant edits and learning phase*,
> <https://www.facebook.com/business/help/316478108955072>, read 2026-08-26.

A bench of creatives held back as a mid-flight swap-in is a scheduled learning
reset. Either load them at launch, or decide knowingly to pay the reset. There is
no third option where you add an ad for free.

**Pausing an individual ad is not on the significant-edit list.** Pausing the *ad
set* for 7+ days is. So turning a loser off mid-flight is documented-safe in a way
that turning a new one on is not — **[MECHANIC]** for the ad-set case, and
**[UNVERIFIED]**-but-strongly-implied for the individual-ad case, since the list is
explicit about additions and silent about pauses at ad level.

---

## 3. Advantage+ creative — what it does to your work, and how to stop it

**Two vocabularies exist for the same feature set** and they do not match. The UI
uses friendly labels; the API uses enum keys. You need both: the founder sees the
first, the MCP takes the second.

### The API surface — exact field names

> **[MECHANIC]** Each feature is controlled by `creative_features_spec` inside
> `degrees_of_freedom_spec`, via an `enroll_status` field taking **`OPT_IN`** or
> **`OPT_OUT`**:
>
> ```json
> {
>   "degrees_of_freedom_spec": {
>     "creative_features_spec": {
>       "<feature_name>": { "enroll_status": "OPT_OUT" }
>     }
>   }
> }
> ```
>
> — Meta for Developers, *Get Started with Advantage+ Creative*,
> <https://developers.facebook.com/documentation/ads-commerce/marketing-api/creative/advantage-creative/get-started.md>,
> read 2026-08-26.

The complete feature-key list from that page, read 2026-08-26:

`adapt_to_placement` · `add_text_overlay` · `creative_stickers` ·
`description_automation` · `enhance_cta` · `image_animation` ·
`image_background_gen` · `image_brightness_and_contrast` · `image_templates` ·
`image_text_translation` · `image_touchups` · `image_uncrop` · `inline_comment` ·
`media_type_automation` · `music` · `pac_relaxation` · `product_extensions` ·
`reveal_details_over_time` · `text_optimizations` · `text_translation` ·
`translate_voiceover` · `video_auto_crop` · `video_filtering` · `video_uncrop`

**`music` is the exception** and does not use `creative_features_spec`: opt out
with `"asset_feed_spec": { "audios": [] }` (same page, read 2026-08-26).

### The four that will damage a composed layout

For a Luvley ad card — a finished, composed image whose own headline is part of the
artwork — these are the ones that matter:

| Key | What it does | Why it breaks a card |
| --- | --- | --- |
| `text_optimizations` | Rewrites primary text and headline | Breaks the "copy is selected, never authored" rule the campaign is built on (`luvley-ads` LEDGER rule 7) |
| `image_uncrop` | Extends/expands the image beyond its frame | The layout's margins are the design |
| `adapt_to_placement` | Re-fits the image to each placement | A cover crop has already sliced a card's own headline in half — recorded at `scripts/ads-v4/v4-02-wall-input-pinned-4x5.mjs` |
| `image_brightness_and_contrast` | Adjusts tone | Flat colour blocks are picked deliberately |

**[MECHANIC]** Meta states that enhancements are on by default for some formats:
"Some enhancements may be turned on by default, but you can turn them off at any
time." — Meta, *About Advantage+ creative*,
<https://www.facebook.com/business/help/297506218282224>, read 2026-08-26. **So
opting out is an action, not a default.**

**If the MCP does not expose `degrees_of_freedom_spec`, this becomes a manual Ads
Manager gate before unpausing.** Treat it as a launch blocker, not a nice-to-have.

### The UI surface — what the founder will see in Ads Manager

The Business Help Center lists these labels (AI-flagged ones marked by Meta), read
2026-08-26 from <https://www.facebook.com/business/help/297506218282224>:

Add animation (AI) · Add details to ad layout · Add dynamic overlays · Add music
(AI) · Add overlays (AI) · Add product browsing · Add product tags · Add standard
label · Add video effects (AI) · Adjust brightness and contrast · Background
generation (AI) · Create sticker CTA (AI) · Dynamic description · Enhance CTA (AI)
· Enhance media text (AI) · Flex media · Highlight carousel card · Image generation
(AI) · Image touch-ups (AI) · Profile end card · Relevant comments · Reveal details
over time · Show highlights (AI) · Show spotlights · Show summaries (AI) · Store
locations · Text generation (AI) · Text improvements (AI) · Translations (AI) ·
Video subtitles (AI) · Video touch-ups (AI) · Visual touch-ups (AI)

**The two lists do not map one-to-one**, and Meta does not publish a crosswalk.
Do not assume a UI toggle you turned off corresponds to the API key you think it
does — **[UNVERIFIED]** in both directions. Verify with `ads_get_ad_preview` or by
looking at the ad in Ads Manager.

**One legal note that is easy to miss:** "Ad images created or materially edited
with certain Meta generative AI creative features […] may include AI info on the
About this ad screen […] or have an **AI info label** next to the Ad label." (same
page, read 2026-08-26). Leaving generative enhancements on can put an AI label on
a Luvley ad.

---

## 4. Creative fatigue

> **[MECHANIC]** "**Before a campaign is active:** If we predict creative fatigue may
> occur in the first 7 days of your campaign, we will warn you before you publish
> your ad.
>
> **After a campaign is active:** When we believe that your audience has seen the
> same ad too many times, you will see **Creative limited** or **Creative fatigue**
> in the Delivery column status […] We consider all recent exposures of the ad's
> image or video, **including those from other campaigns from your Page**. We also
> consider your ad's cost per result. When cost per result is more than ads you ran
> in the past but **less than twice** as much, you will see a **Creative limited**
> status. When cost per result is **more than or equal to twice** as much as ads you
> ran in the past, you will see a **Creative fatigue** status."
>
> — Meta, *About creative fatigue recommendations in Meta Ads Manager*,
> <https://www.facebook.com/business/help/1346816142327858>, read 2026-08-26.

Meta's own remedies, same page:

- **Create another ad** — "a new image or video that is **materially different**
  from the original creative." And the counter-intuitive note: "**Keeping your
  original ad active instead of pausing or turning it off may maximize results.**"
- **Expand your audience.**
- **Try Meta Advantage+ creative** — with the constraint that it is "only available
  for campaigns using the **traffic or sales** objectives with website destination."

**Eligibility caveat that removes this feature from most real setups:** "This
feature is only available for ad sets with **one creative** except those with
Advantage+ catalog ads (previously dynamic ads), dynamic creative, or Meta
Advantage+ app campaigns. It is not available with the sales objective before an
ad set is active." (same page, read 2026-08-26.) A 16-ad ad set will not get this
diagnostic.

**Horizon:** Meta's own prediction window is "the first 7 days", so fatigue is a
within-first-fortnight phenomenon at meaningful budget, not a month-three problem.
Two implications: a 14-day test's second week may already be fatigued, and
"replace the creative" is a *significant edit* that resets learning
([`DELIVERY.md` §4](DELIVERY.md)) — so the remedy and the diagnosis fight each
other on a short run.

---

## 5. Image specs — current as of 2026-08-26

**These changed and the repo's figures are stale.** Meta's Ads Guide now
recommends **4:5 at 1440×1800** for both Facebook Feed and Instagram Feed, and the
*minimums* are far lower than the "1080×1080 / 1080×1350" figure carried in
`D:\Luvley Ad Campaign\CAMPAIGN-BUILD-SPEC.md` §4.1 (2026-08-26).

### Facebook Feed — image

> — Meta Ads Guide, <https://www.facebook.com/business/ads-guide/image/facebook-feed>,
> read 2026-08-26.

| | |
| --- | --- |
| File type | JPG or PNG |
| Recommended ratio | **4:5** |
| Recommended resolution | **1440 × 1800** |
| Primary text | **50–150 characters** |
| Headline | **27 characters** |
| Max file size | 30 MB |
| Minimum width | **600 px** |
| Minimum height (4:5) | **750 px** |
| Aspect ratio tolerance | **3%** |

### Instagram Feed — image

> — Meta Ads Guide, <https://www.facebook.com/business/ads-guide/image/instagram-feed>,
> read 2026-08-26.

| | |
| --- | --- |
| File type | JPG or PNG |
| Recommended ratio | **4:5** |
| Recommended resolution | **1440 × 1800** |
| Primary text | **125 characters** |
| Headline | **40 characters** |
| Max hashtags | 30 |
| Max file size | 30 MB |
| Minimum width | **500 px** |
| Minimum aspect ratio | **400 × 500** (i.e. 4:5 — nothing taller) |
| Maximum aspect ratio | **191 × 100** (i.e. 1.91:1 — nothing wider) |
| Aspect ratio tolerance | **1%** |

**Three things that bite:**

1. **The headline limit differs by placement** — 27 on Facebook Feed, 40 on
   Instagram Feed. A single ad served to both is truncated on Facebook at 28. Write
   to 27 or accept the truncation knowingly.
2. **Instagram Feed will not take anything taller than 4:5.** A 9:16 asset is out
   of range for that placement entirely.
3. **A 1:1 square is inside Instagram's range** (between 4:5 and 1.91:1) and inside
   Facebook's tolerance, so the mixed 1:1 / 4:5 card set is valid — but 4:5 is what
   Meta recommends for both, and it occupies more vertical screen.

**[UNVERIFIED] — Stories and Reels specs are not in this file.** The Ads Guide
pages for those placements were not reachable at a guessable URL on 2026-08-26.
Look them up from <https://www.facebook.com/business/ads-guide/> before shipping a
9:16 asset, and add them here with a date when you do.

---

## 6. A static served into Reels and Stories — what is actually documented

**[CONTESTED].** The repo asserts it plainly:

> `docs/launch/CANARY-GO-REPORT.md:637-642` (2026-08-13): "given a static and
> automatic placements Meta does not skip Reels — it **auto-crops the static to
> 9:16 and serves it anyway**, buying near-zero-CTR impressions."

**What Meta documents that supports the mechanism:** `adapt_to_placement` and
`image_uncrop` exist as creative features precisely to re-fit an asset across
placements (§3), and Meta's own placement guidance recommends "**asset
customization** […] to choose the ideal assets for each placement for a single ad"
(*About managing ad volume*, read 2026-08-26) — which only makes sense if the
default is a system-chosen fit.

**What Meta documents that opposes the conclusion:** the 11-opportunity worked
example arguing that excluding a placement on per-placement cost is usually a
mistake ([`DELIVERY.md` §7](DELIVERY.md)), plus "Multiple placements increase the
number of people who can see your ad and can improve ad results. **Adding more
placements does not increase the cost of your ad.**" — Meta, *About ad placements
across Meta technologies*,
<https://www.facebook.com/business/help/407108559393196>, read 2026-08-26.

**What no source found on 2026-08-26 establishes:** that the auto-fitted static
performs badly enough in those surfaces to be worth excluding. That is the actual
claim, and it is **[UNVERIFIED]**.

**The resolution that costs nothing:** turn `adapt_to_placement` and `image_uncrop`
**off**, and supply per-placement assets via asset customisation if you want those
surfaces. Then the choice is about inventory, not about mangled artwork — which is
the honest version of the question.

---

## 7. Where the taste lives

Which cards, what they argue, the founder's verdicts, the copy rule ("selected,
never authored") — none of that is here. It is
[`.claude/skills/luvley-ads/LEDGER.md`](../luvley-ads/LEDGER.md) and
[`CARD-BRIEF.md`](../luvley-ads/CARD-BRIEF.md). The current slate and its
reasoning are `D:\Luvley Ad Campaign\CAMPAIGN-BUILD-SPEC.md` §4.
