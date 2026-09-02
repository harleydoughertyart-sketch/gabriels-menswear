---
version: alpha
name: Gabriel's Menswear
description: Warm editorial tailoring. A refined Holden boutique that reads as trustworthy local retail, never as a template.
colors:
  primary: "#211A16"
  secondary: "#75685E"
  tertiary: "#7A2E2A"
  neutral: "#F7F0E6"
  paper: "#FFF8EE"
  white: "#FFFFFF"
  charcoal: "#2B211C"
  walnut: "#5C3B2F"
  brass: "#A97A43"
  brassSoft: "#E2C89F"
  line: "#DFD1BF"
  secondaryOnDark: "#3C332E"
typography:
  h1:
    fontFamily: Newsreader
    fontSize: 4.875rem
    fontWeight: 650
    lineHeight: 0.95
    letterSpacing: "0em"
  h2:
    fontFamily: Newsreader
    fontSize: 3.5rem
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: "0em"
  h3:
    fontFamily: IBM Plex Sans
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0em"
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  eyebrow:
    fontFamily: IBM Plex Sans
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0em"
  blockquote:
    fontFamily: Newsreader
    fontSize: 1.5rem
    fontWeight: 400
    lineHeight: 1.35
rounded:
  sm: 6px
spacing:
  xs: 10px
  sm: 18px
  md: 20px
  lg: 24px
  xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.brassSoft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 20px
    height: 50px
  button-primary-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
  button-secondary:
    backgroundColor: "{colors.secondaryOnDark}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: 20px
    height: 50px
  button-secondary-dark:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 20px
    height: 50px
  surface-page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
  surface-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 24px
  surface-inverse:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.white}"
  surface-visit:
    backgroundColor: "{colors.walnut}"
    textColor: "{colors.white}"
    padding: 24px
  link-accent:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.tertiary}"
  rule-hairline:
    backgroundColor: "{colors.line}"
    height: 1px
---

## Overview

Gabriel's Menswear is a menswear and tailoring store in Holden, Massachusetts, run by a Senior Master Tailor with more than thirty years at the bench and sourcing out of Turkey and Italy. The site exists to turn local search and Google Maps traffic into store visits, calls, and fittings.

The design brief follows from that job. The shopper arrives anxious about fit and short on time, often for a wedding, prom, funeral, interview, or business event. So the surface has to read as a refined boutique that is nonetheless easy to walk into: warm, editorial, tactile, confident. Two failure states are equally bad. Cold luxury minimalism makes a local shopper feel they will be judged. Generic template polish makes the thirty years of craft invisible.

Everything below was extracted from the shipping site rather than invented, so these tokens describe what Gabriel's already looks like. Treat them as brand truth. Where a value was derived rather than read directly, it is flagged.

## Colors

The palette is warm-neutral with one deep red accent. It is a paper-and-wood world, not a black-and-white one — there is no pure grey anywhere in it.

- **Primary (#211A16)** — ink. All body copy and headlines. A warm near-black; never substitute `#000000`, which reads cold against the canvas.
- **Secondary (#75685E)** — muted stone, for supporting copy, captions, and metadata. It is the only permitted de-emphasis; do not fake it by reducing the opacity of ink.
- **Tertiary (#7A2E2A)** — oxblood. The interactive accent, and the only colour that signals something can be clicked: navigation hover, inline links, icons, and eyebrows on dark ground. Used sparingly, never as a fill for anything large.
- **Neutral (#F7F0E6)** — canvas. The default page ground. The site is light by default; dark sections are deliberate exceptions.
- **paper (#FFF8EE)** — the raised card ground, one step warmer and lighter than canvas. This one-step lift is how surfaces separate, since the design uses almost no shadow.
- **brassSoft (#E2C89F)** — the primary button fill. Softer than brass so that a large filled control does not shout.
- **charcoal (#2B211C)** — the inverse section ground. Warm, not neutral.
- **walnut (#5C3B2F)** — the ground for the visit section, the one block on the page that asks the shopper to come in. It is the warmest, heaviest surface in the system and it appears exactly once.
- **brass (#A97A43)** — *defined but currently unused.* The shipping stylesheet declares it and never applies it; `brassSoft` carries the metallic role instead. It is recorded here because it is real, but until it earns a job it is a decision waiting to be made, not a token to reach for.
- **line (#DFD1BF)** — hairline rules and borders on light ground.
- **secondaryOnDark (#3C332E)** — *derived value.* The shipping CSS paints secondary buttons as `rgba(255,255,255,0.08)` over charcoal. Token specs carry flat sRGB only, so this is that blend resolved. If the ground beneath a secondary button is ever not charcoal, recompute rather than reusing this hex.

## Typography

Two families, with a hard division of labour. **Newsreader** carries display: h1, h2, and pull quotes. It is the editorial voice and the reason the page reads as a magazine feature rather than a shopfront. **IBM Plex Sans** carries everything else: h3, body, labels, controls, navigation.

Do not let them trade jobs. A Newsreader button or a Plex Sans hero collapses the whole distinction.

Display weight is 650, not 700 — a deliberate half-step that keeps large serif headlines from turning heavy. Display line height is tight and sub-1 (0.95 for h1, 0.98 for h2), which is what makes multi-line headlines stack as a block. Letter spacing is zero throughout; the fonts are trusted at their natural fit.

The h1 and h2 sizes recorded above are the **desktop maxima**. The shipping site scales them fluidly — h1 between 48px and 78px, h2 between 34px and 56px — and any renderer working from this spec should treat the token as the ceiling of that range, not a fixed size. Body is 16px at 1.6.

## Layout

One column, centred, capped at 1120px, with a 24px gutter. Headlines balance their line breaks rather than ragging naturally.

The spacing scale is small and rhythmic: 10px between a heading and its immediate paragraph, 18px under an eyebrow, 20px under h2, 24px under h1 and inside cards, 48px between distinct blocks. Vertical rhythm carries the hierarchy, because there are almost no boxes doing it instead.

## Elevation & Depth

There is effectively no elevation system, and that is a decision rather than an omission. Depth comes from three things in this order: the one-step warmth lift from canvas to paper, hairline rules in `line`, and full-bleed inverse sections in charcoal. Drop shadows are not part of this brand. A card that needs a shadow to be legible is a card sitting on the wrong ground.

## Shapes

One radius, 6px, on everything that gets one. There is no small-medium-large ladder to choose from, and adding one would read as a different brand. Corners are soft enough to feel considered and tight enough to stay tailored.

## Components

`button-primary` is a filled brassSoft control with ink text, 50px tall, and it is the only high-emphasis action in a view. Its hover state lifts the fill to white rather than darkening it, so interaction feels like light arriving.

`button-secondary` is the companion on inverse grounds; `button-secondary-dark` is the same control on canvas, where the shipping site draws it as transparent with an ink hairline border. The token records the resulting light ground.

`link-accent` is oxblood text on canvas and is the page's only clickability signal outside a button. `rule-hairline` is a one-pixel `line` divider, the workhorse of a system with no shadows. `surface-visit` is the walnut block; there is one per page and adding a second would flatten its meaning.

Motion is short and eased, and it is part of the brand rather than decoration. Four durations are in use: 120ms for press, 160ms for hover, 220ms for panels, 460ms for reveals. Two easings: `cubic-bezier(0.23, 1, 0.32, 1)` for anything entering or responding, and `cubic-bezier(0.77, 0, 0.175, 1)` for anything that moves in and out symmetrically. These live in prose because the token format carries dimensions, not time — but any renderer building motion for this brand should use these numbers verbatim.

## Do's and Don'ts

**Do** keep the page light by default and treat charcoal sections as punctuation.

**Do** let Newsreader do the emotional work and Plex Sans do the functional work.

**Do** earn depth with warmth and hairlines instead of shadow.

**Do** hold walnut to a single block per page and oxblood to interactive elements. Their scarcity is what gives them weight.

**Don't** use pure black or pure grey. Every neutral in this system is warm.

**Don't** add a second radius, a shadow scale, or a third typeface. Each one moves the brand toward the generic template the rebuild existed to escape.

**Don't** communicate de-emphasis with opacity. Use the secondary colour.

**Don't** stretch display type with letter spacing, and don't set display weight above 650.
