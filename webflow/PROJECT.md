# Project: D:\Gabriels Menswear

What every webflow run on this project needs to know. Kept across runs; update it when the project changes.

## Stack
stack: static
Plain HTML, CSS and JS at the project root, no build step, no package.json. Vercel serves it with
cleanUrls (`/x` serves `x.html`) and trailingSlash false; www redirects to gabrielsmenswear.com. The home
page (index.html) carries its own styles inline and runs Nate Herk's scrollcraft engine (scrollcraft.js and
scrollcraft.css, MIT: never edit them). New pages are assembled by `wf assemble` from section fragments in
`webflow/build/<page>/` and page shells (`webflow/build/<page>/_shell.html`); their CSS and JS land in
`assets/wf/`. Git repo (main); Harley commits and deploys himself.

## Commands
build: none
serve: node "C:\Users\hdougherty\.agents\skills\webflow\tools\serve.mjs" <port> --dir "D:\Gabriels Menswear"
preview_dir: D:\Gabriels Menswear

## Pages
- `/` index.html: the scroll page (hero scrub, the week, menswear, the wedding fitting, occasions rail,
  stitch, reviews and Gabriel, FAQ, visit, close). Existing.
- `/privacy` privacy.html. Existing.
- `/msm` msm.html: an archived copy of another business's site (Main Street Menswear, Billings MT). Not
  linked from anywhere; never used as a source.
- New in run 2026-10-03-local-pages: `/tailoring`, `/weddings`, `/prom`, `/book`.

## Design source
The live home page, index.html: its inline `:root` tokens (canvas #f7f5f1, surface #ffffff, ink #152238,
ink-soft #51617a, accent #33627c), Playfair Display and Archivo (self-hosted in `assets/fonts/`, declared inline in each page head), the gm-* components in its
inline style block (lines 75 to 926), and scrollcraft.css. DESIGN.md and tokens.json describe the earlier
warm version and are out of date: never use them as the design source.

## Ports
reserved: 4173, 4180
range: 4640-4699

## Targets
lighthouse_mobile: performance 90, accessibility 100, best-practices 100, seo 100

## Never publish
- Anything from msm.html: the other business's name in its own right, its towns (Billings, Rapid City), its
  staff names, its email address and its prices or offers.
- Values from `.env`, the Vercel project and team IDs in AGENTS.md, and anything in `_local/`.

## Current run: 2026-10-08-interactive-refresh
Tailoring, Weddings and Prom are refreshed for local preview. Preserve the original homepage content and approved service designs; later user authorization added the shared bottom action bar, complete footer, homepage topbar Directions removal, service review rails and a direct-copy humanizer pass. Book and Privacy received the shared navigation/footer only. New gm-premium.css/js are service-only. User permits illustrative stock/AI video; Weddings and Prom use newly licensed stock edits. Lean verification, no numeric review loops or Lighthouse finish-gate claim. Current preview revision is r17 on port 4640. R17 adds a portrait-led Book page, hero action pairs, an anchored bottom action strip, automatic review movement, public Privacy/Cookies/Website terms pages and an explicit-public-file hosting build. Email fitting requests are being connected to a user-authorized inbox; opaque FormSubmit activation token remains necessary before enabling public submissions.

## User-derived design evaluation (2026-10-09)
Read DESIGN-EVALUATION.md for the reusable checklist built from the user's Tailoring corrections. The user authorized applying it autonomously to Weddings and Prom, iterating on concrete visual/interaction failures before local preview delivery. Preserve the approved Tailoring R11/R12 and original homepage. Use the current run's WEDDINGS-PROM-EVALUATION.md for current acceptance evidence; older global gate targets above are not a claim that those tests ran.


