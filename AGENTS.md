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

Test the booking function (stand-ins for Resend and Turnstile, no network):

```powershell
node scripts/test-bookings.mjs
```

Re-record the README scroll capture after a visual change:

```powershell
node scripts/capture-scroll.cjs
```

The page also contains JSON-LD for local business and FAQ. Keep visible FAQ text and FAQ schema answers in sync.
`llms.txt` restates the same facts for AI search; update it when hours, phone, services or FAQ answers change.

## Bookings

- The /book form books a fitting; it is not a request. Any date and time inside shop hours can be picked, from today up to a year ahead (`assets/wf/book-controls.js`), and nothing checks for clashes.
- The form posts to `/api/book` (`api/book.mjs`, a Vercel function with no npm dependencies; the code is in `api/_lib/`). It checks Cloudflare Turnstile, then the date and time against the same shop hours (`api/_lib/shop.mjs`), then sends through Resend from `bookings@gabrielsmenswear.com`, in this order:
  1. The reminder, scheduled in Resend for 10:00 AM Holden time the day before the visit, when that is between 12 hours and 29 days 23 hours away. Resend holds a scheduled email for 30 days at most, so later visits get none.
  2. The customer's confirmation, with a calendar file whose alert goes off a day ahead. It mentions the reminder only when one was scheduled.
  3. The shop's copy to `SHOP_EMAIL`, with reply-to set to the customer. It says when the reminder goes out, or why there is none. Its "Stop the reminder" button opens that email in Resend's dashboard, where it can be cancelled or moved.
- Then the visitor lands on `/booked`. A failed Turnstile check, a form the server turns down, or neither email going out sends them back to `/book?error=check|form|send`, and the page says what happened. A reminder that can't be scheduled never stops a booking.
- Nothing is stored: no database and no booking list. Resend has the emails and holds the scheduled reminder until it goes out. Function logs carry a booking's id and date, never a name or email.
- Environment variables (Vercel): `RESEND_API_KEY` (a sending-only key is enough), `TURNSTILE_SECRET_KEY` and `SHOP_EMAIL` (the inbox for the shop's copy; a comma list works). Optional: `MAIL_FROM` (defaults to `Gabriel’s Menswear <bookings@gabrielsmenswear.com>`) and `TURNSTILE_HOSTNAMES` (a comma list; defaults to gabrielsmenswear.com, www.gabrielsmenswear.com and gabriels-menswear.vercel.app).
- The Turnstile site key is public and sits in `assets/fitting-request-config.js`. Empty turns online booking off, and the form says to call. Local hosts use Cloudflare's always-pass test key.
- The emails are written in `api/_lib/emails.mjs`, in Gabriel's voice. They load the logo from `assets/email/`, which `scripts/build-site.mjs` copies into `dist/` though no page links it.
- `booked.html` (noindex, not in the sitemap) shows the visit the form saved as `gm-booking` in localStorage: date, time, group size and occasion, never the name or email. The privacy and cookies pages say so, and name Resend and Turnstile; keep them in step.
- `book.html` and `assets/wf/book.js` are built from `webflow/build/book/` by `wf assemble`. Where that isn't available, make the same change in the fragment and in the built file.

## Speed

- `scripts/build-site.mjs` inlines each page's local stylesheets into `dist/`. Source pages keep their `<link>` tags.
- Each page head defines `gmAfterFirstPaint`. GTM, GA4, the home page's clips and /tailoring's clips (`assets/gm-premium.js`) start only after the first screen has painted. gtm.js loads once gtag.js has run; loaded together, GTM fetched a second copy of gtag (about 180 KB).
- The Google Maps embed (about 600 KB of script) carries its address in `data-map-src`; `assets/gm-nav.js` sets it after first paint, once the map is within a screen of view. A map iframe with a plain `src` held /book's first paint back (PageSpeed LCP 6 s).
- Turnstile's script loads the first time someone touches the booking form, not with the page.
- Clip posters in the HTML are the phone versions; scripts swap in the desktop poster on wider screens. The home page's clips get their posters late on purpose.
- Speed and SEO are proven with seo-gate (`seo-gate.json` here); the reply quotes its summary line.
- Fonts are self-hosted in `assets/fonts/`. Do not re-add Google Fonts links.
- `/assets` media is cached for a year (`vercel.json`). Replace an image or clip under a new file name, never in place.

## Tracking

- GA4 (`G-GBHF2MRV3Z`) is configured in every page head, so each page view carries its landing page and traffic source.
- `assets/gm-nav.js`, loaded on every page, is the one tracker: `call_click`, `directions_click`, `reviews_click` and `book_click` (with `link_location` and `link_text`), `tab_select` (`tab_name`), `faq_open` (`faq_question`) and `section_view` (`section_name`, once per section). A link's `data-event` overrides the name. Do not add a second listener elsewhere, or events count twice.
- GA4 custom dimensions exist for `link_location`, `fitting_for`, `occasion`, `tab_name`, `faq_question` and `section_name`. A new event parameter needs its own custom dimension before it shows in reports.
- The fitting form sends `generate_lead` (`fitting_for`, `occasion`) when Book is pressed and Turnstile's check has passed, just before the form posts. `/booked` sends `book_confirmed` (same parameters) once per booking, so it counts only bookings that went through.
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
