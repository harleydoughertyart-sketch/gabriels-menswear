# The card brief

You are authoring **one** Luvley ad card. Other agents are authoring theirs at
the same time, each on its own file and its own card id, so nothing you need is
contended.

## Read these first, in this order

1. **[`LEDGER.md`](LEDGER.md)** — the founder's verdicts on every card he has
   judged, and the rules they imply. Binding.
2. **[`scripts/ads-v4/v4-00-fanned-hero.mjs`](../../../scripts/ads-v4/v4-00-fanned-hero.mjs)**
   — the reference card. Copy it to start; its header is the how-to.
3. **[`scripts/lib/ad-card-shell.mjs`](../../../scripts/lib/ad-card-shell.mjs)** —
   the page shell and the closed ground menu.
4. **[`scripts/lib/ad-brand-motifs.mjs`](../../../scripts/lib/ad-brand-motifs.mjs)**
   — the five motifs. Its header is the design document.

## Your job, in three parts

**One.** Write `scripts/ads-v4/<your card id>.mjs` by copying the reference card
and changing `CARD`, `styles` and `body`. Nothing else.

**Two.** Run it: `node scripts/ads-v4/<your card id>.mjs`.

**Three — this is the half that gets skipped, so do it deliberately.** Open the
phone twin it wrote and *look at it*. Fix what you see. Render again. Keep going
until you would put it in front of the founder. Ask, in order:

- Is anything overlapping, colliding, or sitting on top of something else?
- Is there a hole — a region over about 12% of the frame doing no work?
- What does the eye read first, second, third? Is that the order you wanted?
- Is the product photograph still the biggest thing in the frame?
- At phone size, can you read the headline and the button without squinting?

A card that renders is not a card that is finished. Every real defect in the
first round was found by looking, and none by reasoning about the code.

## The rules you cannot break

- **A finished ad must be visible in the frame.** *"If there's no ad in the ad,
  then it's not really good."* The only exemption is a card whose entire claim is
  fidelity of the piece itself.
- **The ground menu is closed** to `blush`, `paper` and `ink` in `GROUNDS`, plus
  the solid pink colour block. Gold inside a photograph is fine — a gold ring is
  a gold ring — but never as the frame's own colour.
- **Copy is never authored.** Every string comes from a founder-picked take in
  `D:\Luvley Ad Campaign\jewelry-canary\plans\*.plans.json` or from a line already
  published in `marketing/src/content/landing/jewelry.ts`, and carries a `source`
  in your `COPY` object naming file and line. The one authorised divergence is the
  spelling: **jewelry**, never jewellery. If no existing line fits your card,
  change the card.
- **One loud thing per frame.** The founder rejects boring *and* crazy. Pick your
  event — the fan, the wall, the colour block, the big CTA — and let the rest
  support it.
- **Teal never appears.** White on `--pink-hot` is 2.51:1 and never ships:
  `--pink-hot` takes `--ink`, `--accent-deep` takes white.
- **Shared modules are read-only to you.** `ad-card-shell.mjs`,
  `ad-card-render.mjs`, `ad-brand-motifs.mjs`, `ad-fonts.mjs`, `ad-hand.mjs`. If
  one genuinely blocks you, report it — the coordinator fixes it centrally, and
  several cards hitting the same wall is how the shared layer improves.
- **Never glob `ad-*` for images.** `wall/ad-wave-red-silk.jpg` and
  `wall/ad-wave-velvet-tray.jpg` are named like ads and are plain product
  photographs.

## Traps that have each cost a render cycle

- **`<figure>` carries a UA `margin: 1em 40px`** and the shell resets only
  `box-sizing`. Five agents hit this in three disguises: a wall rendering as
  scattered tiles, a flex row 80px wider than its content box, and a declared
  bleed stopping 40px short. The shell resets it now — if you see spacing you did
  not write, check this first.
- **`transform: scale()` on an `<img>` grows its own box**, so the clip guard
  refuses a crop the parent has already hidden. Crop with a CSS background
  instead.
- **On `ink`, pass `ground: 'dark'` to `headlineCss`.** The default is light and
  would set the keyword in `--accent-deep`, which is 2.2:1 on charcoal.
- **`gridStrength` clamps at ~1.72.** Past that every value renders identically.
- **A deliberate bleed is declared** with `data-bleed`, or the clip guard refuses
  it.

## The assets

**Finished ads** — real, laid-out ads with their own copy on them. These are the
only four, and the first rule is about these:

| file | what it is |
| --- | --- |
| `D:\Luvley Looks Library\jewelry-twist-solitaire-process\3-ad-with-copy.png` | twist solitaire in its box |
| `marketing/public/assets/launch/results/pairs/jewelry-halo-ad.jpg` | halo ring, knockout "MADE TO LAST" |
| `marketing/public/assets/launch/landing-jewelry/ads-final-sapphire.jpg` | pink sapphire halo — the pinkest, and the most crop-tolerant |
| `marketing/public/assets/launch/landing-jewelry/wall/ad-notice-details.jpg` | mosaic-inlay earring, already square |

**The one complete three-stage set** — phone photo, Look, finished ad, all of the
SAME piece — is `D:\Luvley Looks Library\jewelry-twist-solitaire-process\`. Prefer
it for any progression: a fan built from three different rings proves nothing.

**A wall's worth of one piece** is the five-stone pendant, in
`marketing/public/assets/launch/home-wall/`. **It has no finished ad**, and the
four pieces that have ads have three images at most — so a wall card must anchor
with another piece's ad and make the change of kind obvious. Four agents hit this
independently; it is a real gap in the material, not a layout problem.

**Before/after pairs:** `marketing/public/assets/launch/results/pairs/` —
`jewelry-campaign-before/-after.jpg` is the strongest, the piece being large and
legible in both halves.

**The mascot:** `marketing/public/assets/brand/luvley-mascot.png`, always through
`dataUri()`. A relative path renders broken and silent in headless Chromium.

## Output and reporting

Your card writes itself to `D:\Luvley Ad Campaign\jewelry-canary\ads-v4\` with a
phone twin and a manifest. Nothing generated goes into git; your `.mjs` does.

Commit only your own card file, then report in four lines:

1. the card id and the phone-twin path;
2. what the card argues, in one sentence;
3. what you changed between your first render and your last, and why;
4. anything you could not do, and what blocked you.

Do not push. Do not open a PR. Do not touch another agent's card.

`npm run check:fast` reports FAILED for any new file in `scripts/ads-v4/` — the
router treats `scripts/` as infra, runs everything, collects zero tests and trips
its own vacuous-green guard. Typechecks pass. It is the mapping, not your card.
