# Gabriel's Menswear Site Handoff

## Active Workspace

Use this folder as the active project:

```powershell
D:\Gabriels Menswear
```

The old working folder at `C:\Users\Harley\Documents\New project` is now just the original build workspace.

## Live Site

- Production URL: https://gabriels-menswear.vercel.app
- GitHub repo: https://github.com/harleydoughertyart-sketch/gabriels-menswear
- Vercel project: `gabriels-menswear`
- Vercel project ID: `prj_ffrD7fRQtVbFapn8GNEEQHaGV4Bm`
- Vercel team/org ID: `team_gEI0DmAeJirvGL6sHLO7XHlK`

## Local Preview

This is a plain static HTML/CSS/JS site.

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/index.html
```

## Validation

```powershell
node --check .\script.js
```

Re-record the README scroll capture after a visual change:

```powershell
node scripts/capture-scroll.cjs
```

The page also contains JSON-LD for local business and FAQ. Keep visible FAQ text and FAQ schema answers in sync.
`llms.txt` restates the same facts for AI search; update it when hours, phone, services or FAQ answers change.

## Bookings

- The /book form books a fitting; it is not a request. Any date and time inside shop hours can be picked (`assets/wf/book-controls.js`), and nothing checks for clashes.
- It posts to FormSubmit with the opaque token in `assets/fitting-request-config.js`. FormSubmit emails the booking to the inbox that token was activated for (Harley's, not Gabriel's), emails the customer a confirmation through `_autoresponse` (its message is that field's value in the form), then sends them to `/booked` through `_next`.
- `booked.html` (noindex, not in the sitemap) shows the visit the form saved as `gm-booking` in localStorage: date, time, group size and occasion, never the name or email. The privacy and cookies pages say so; keep them in step.
- `book.html` and `assets/wf/book.js` are built from `webflow/build/book/` by `wf assemble`. Where that isn't available, make the same change in the fragment and in the built file.

## Speed

- `scripts/build-site.mjs` inlines each page's local stylesheets into `dist/`. Source pages keep their `<link>` tags.
- Each page head defines `gmAfterFirstPaint`. GTM, GA4 and the home page's clips start only after the first screen has painted.
- Fonts are self-hosted in `assets/fonts/`. Do not re-add Google Fonts links.
- `/assets` media is cached for a year (`vercel.json`). Replace an image or clip under a new file name, never in place.

## Tracking

- GA4 (`G-GBHF2MRV3Z`) is configured in every page head, so each page view carries its landing page and traffic source.
- `assets/gm-nav.js`, loaded on every page, is the one tracker: `call_click`, `directions_click`, `reviews_click` and `book_click` (with `link_location` and `link_text`), `tab_select` (`tab_name`), `faq_open` (`faq_question`) and `section_view` (`section_name`, once per section). A link's `data-event` overrides the name. Do not add a second listener elsewhere, or events count twice.
- GA4 custom dimensions exist for `link_location`, `fitting_for`, `occasion`, `tab_name`, `faq_question` and `section_name`. A new event parameter needs its own custom dimension before it shows in reports.
- The fitting form sends `generate_lead` (`fitting_for`, `occasion`) when Book is pressed, before FormSubmit's spam check. `/booked` sends `book_confirmed` (same parameters) once per booking, after the spam check, so it counts only bookings that went through.
- Microsoft Clarity (project `ywmsd790se`, heatmaps and visit replays) loads with GA4 after first paint in every page head. `gm-nav.js` passes each event name to Clarity too, so replays can be filtered to visits that called or booked. The fitting form carries `data-clarity-mask`. The cookies and privacy pages describe Clarity; keep them in step if a tracking service is added or removed.

## Deployment

The folder is linked to the existing Vercel project with `.vercel/project.json`, which is intentionally ignored by Git.

The Vercel project is connected to the GitHub repo. Pushes to `main` should trigger Vercel deployments.

Manual production deploy:

```powershell
npx vercel deploy --prod
```

GitHub is pushed on `main`. Once Vercel has a GitHub Login Connection enabled for this account, connect the repo to the Vercel project from this folder:

```powershell
npx vercel git connect https://github.com/harleydoughertyart-sketch/gabriels-menswear --yes
```

Use manual production deploys only when you need to force a deploy outside the Git flow.
