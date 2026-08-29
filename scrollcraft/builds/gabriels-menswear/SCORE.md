# Score — Gabriel's Menswear

## Grammar: filmic one-shot (lively tempo)

Why the other seven lost:
- **Chaptered editorial** forbids the full-bleed scrub hero and the magnetic
  close; Harley explicitly asked for cool video and a fun, interactive feel.
- **Live surface** is for software; there is no product surface to run.
- **Continuous world** was offered directly ("one unbroken world?") and Harley
  chose distinct scenes.
- **Typographic poster** wastes the photography this brand needs for trust.
- **Gallery/catalog** forbids persuasion copy; the existing copy (kept by
  request) is persuasion-led.
- **Split stage** needs a two-sided argument; there isn't one.
- **Rhythmic cutlist** bans pin and any act over 1.4vh, which kills both scrub
  videos and the assembly peak.

Filmic one-shot fits a single linear argument ("need a suit → Gabriel makes it
simple → call") and carries the two scrub clips. "Lively" is delivered through
tempo: shorter middle acts, fast front-loaded cues, an energetic rail, and a
peak with real spectacle. The registry at `scrollcraft/FINGERPRINTS.md` is
empty, so the fingerprint gate passes trivially; recorded anyway below.

## Signature move (= the peak)

**The suit assembles under scroll, then it's worn.** Act 4 pins; five
alpha-cut flat-lay pieces (jacket, shirt, tie, pocket square, measuring tape;
u2net background removal) converge from off-frame into a composed fitting
flat-lay, each easing in on its own path driven from `--sc-p` by bespoke CSS.
Tailor's chalk lines (SVG, stroke-dashoffset from `--sc-p`) draw fit marks,
then the flat-lay crossfades into the suit worn at an outdoor wedding (groom
from behind, no face) with the closing line. Engine untouched.

## Round 2 (2026-08-29, after Harley's feedback)

- No interiors anywhere; every visual is close-up tailoring b-roll or flat-lay,
  believable as the store's own craft. One shallow-DOF 85mm preamble across the set.
- Hero clip: lateral glide along suit shoulders on wooden hangers (16:9 + 9:16).
- Occasions rail is now a b-roll rail: four looping close-up clips (boutonniere,
  bow tie, knit tie knot, pinned cuff) + finishing flat-lay card, played/paused
  by IntersectionObserver, posters under reduced motion.
- HTML wordmark lockup replaced the boxy logo image; scrims cut to whispers and
  the hero copy moved into the clip's reserved top-left bokeh.
- Typography voice: every headline pairs navy serif with one italic teal phrase;
  chalk-stroke SVG underline on the two key words (hero "simple", peak "Handled").
- Reviews: real Google Business Profile reviews (4.7, 29 reviews, fetched
  2026-08-29), Kelly/Keith excerpted out per Harley; horizontal scrollable strip
  of 8 attributed excerpts.
- Visit section restored with contact panel + Google Maps embed; close slimmed.

## Score table

| # | Beat | Device | Span | Why |
|---|---|---|---|---|
| 1 | Pulled in | `scrub` + kinetic greet | 2.3 | Camera glides along the navy suit wall under their hand; the strongest open |
| 2 | Recognition | `pin` (quick crossfade lines) | 1.8 | The occasions named fast: wedding, prom, interview, funeral |
| 3 | Relief (silence) | `flow` + `reveal` | ~1 | The turn: "Walk in unsure." Calm before the peak |
| 4 | Delight — PEAK | `pin` + bespoke assembly | 3.4 | Largest span on the page by a visible margin |
| 5 | Appetite | `pan` + tilt | 2.9 | The range travels sideways; heading rides the rail |
| 6 | Trust | `scrub` (macro) | 1.7 | Fabric and chalk at macro scale; second and last clip |
| 7 | Assurance | `flow` + `in` | ~1.6 | Real reviews, Gabriel's real portrait and story |
| 8 | Resolve | `pin` + spotlight + magnet | 1.15 | Hours, address, one number; footer inside the stage |

Total ≈ 13.9 viewport-heights, 8 acts. Families: scrub, pin, flow, reveal,
kinetic, pan, pointer (7). No family twice in a row. Two scrub acts. Peak has
the largest span; act 3 is the authored quiet before it.

## Fingerprint row (to append after shipping)

| Build | Grammar | Nav | Hero device | Act shape | Close | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| gabriels-menswear | filmic one-shot | fixed minimal bar, logo card + call CTA | full-bleed suit-wall scrub, corner kinetic greet | scrub-pin-flow-pin-pan-scrub-flow-pin, 8 acts, ~13.9vh | pinned contact close, spotlight + magnetic call button, footer in stage | suit assembles + chalk fit-marks under scroll | high-key white/blue editorial menswear | 4500 |

## Palette (from Final Design.png)

- canvas `#F7F5F1` (logo card warm white), surface `#FFFFFF`
- ink `#152238` (deep navy), ink-soft `#51617A` (slate)
- accent `#33627C` (logo teal border), accent-ink `#FFFFFF`
- drift stops stay in the light family: `#F7F5F1 → #EEF2F4 → #E4EBEF → #F7F5F1`
- fonts: Playfair Display (display, echoes the logo serif), Archivo (text)
