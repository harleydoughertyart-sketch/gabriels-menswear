---
name: mobile
description: Use when the founder is away from his desk — at the gym, on the road, on his phone — and must be able to see, judge and direct work entirely from artifacts left in the chat thread. Use when he says he is going mobile, going to the gym, working from his phone, has no localhost, or asks for something he can look at without opening a file. Switches every deliverable from "a file to open" to "an image, PDF or clip in the thread".
---

# Working while he is on his phone

He can still decide everything. He just cannot open anything.

> "I want a mobile skill I can call before going to the gym... it stops trying to
> open HTML documents and files, and instead makes PDFs, before and after images,
> short clips, whatever the best artifact possible to showcase the changes. So I
> don't have to test them directly inside of localhost, because I won't have
> access. I could still see everything and orchestrate just from the artifacts
> left inside of the chat."
> — founder, 2026-08-26

**The rule is one sentence: nothing he needs is behind a click he cannot make.**

---

## What changes the moment this is on

| Normally | On mobile |
| --- | --- |
| "Open `D:\Luvley UI Evidence\foo\sheet.html`" | The sheet, converted, **sent into the thread** |
| "Check `http://localhost:5194/app/`" | Screenshots of that page, both viewports |
| "The evidence is at `<path>`" | The evidence *is in the message* |
| A wall of prose | The lede, a small table, the images |
| A question in a paragraph | A question in the ❓ block, at the end |

A path is still worth printing **after** the artifact, so he can find it later at
his desk. It is never the deliverable on its own.

---

## The one command

Every HTML proof this repo makes — `ui-evidence.mjs` sheets, `looks:review`
pages, gauntlet sheets — converts with:

```bash
node scripts/mobile-artifacts.mjs --html "<path to sheet.html>"
```

It writes `<name>-phone.png` (whole page at 390px, 2x, one tap to zoom) and
`<name>.pdf` (paginated), prints `wrote: <absolute path>` for each, and puts them
beside the sheet unless `--out` says otherwise. Then send them with
`SendUserFile`.

**Pick one, do not send both.** A tall PNG beats a PDF at two or three rows and
loses badly at twenty. Short sheet → PNG. Long sheet → PDF. The script does not
choose for you on purpose.

---

## Many agents at once: one digest, not one sheet each

When several crewmates are in flight, he wants to judge the RESULTS rather than
follow the process:

> "If I can see ten different problems and then how they were solved, and I don't
> like some of the solutions because they're ugly or they just aren't human or
> intuitive or a little too extra, I wanna be able to see that and then change it."

```bash
node scripts/evidence-digest.mjs --limit 10 --phone
```

It walks every `D:\Luvley UI Evidence\<task>\manifest.json`, stacks them newest
first, and hands the combined manifest to `ui-evidence.mjs` — one renderer, one
look. `--since 2026-08-26` for today only, `--tasks a,b,c` for a named few.

**It adds nothing to the agent doing the work.** An agent that writes its
evidence the way AGENTS.md already requires is in the digest automatically. Do
not ask crewmates to produce anything extra for it.

**Three defaults, all learned from him reading the first one on a phone.** Each
is a default rather than a flag because the flag would never get typed:

| Default | Why | Undo |
| --- | --- | --- |
| A row needs **one image that exists** | *"Just words in the PDF is worthless to me."* Not a pair — a brand-new surface legitimately has no before. | `--all-rows` |
| The long `details` prose is **dropped** | It earns its place auditing ONE change and becomes a wall across six. `finding` and `note` survive: the problem and the fix, one line each. | `--details` |
| A row declared **`"weight": "minor"`** is held back | *"I want large structural changes... I don't want to get bogged down by all this extra small code changes."* | `--all-rows` |

**`weight` opts OUT, and that direction matters.** A missing weight always shows.
Only an explicit `"weight": "minor"` on a shot — or on the manifest, as a
task-wide default — removes a row, so an agent that never heard of the field can
never produce an invisible one. **When you write a manifest, mark your own small
rows `minor`.** You know which they are; he does not, and he is the one scrolling.
`--major` goes further and shows only rows positively vouched `"major"`.

Held-back and dropped rows are always printed by name. A digest that silently
omits reads as "this is everything", which is the one thing it must not imply.

---

## Which artifact for which change

Choose by what the change actually is, not by habit:

- **A visible UI change** → before/after PNGs, **both viewports**, sent directly.
  This is the common case and it needs no sheet at all. Send the images.
- **A flow, a sequence, several states** → the evidence sheet, converted. A
  sequence needs the rows in order and a chat thread reorders nothing.
- **Something that only reads as motion** — an animation, a transition, a reel —
  → a **short clip**, five to ten seconds. Endpoint stills photograph perfectly
  even when the animation is broken, so a still pair cannot prove motion.
  - Record it in the **same** Playwright run as the screenshots —
    `recordVideo: { dir, size }` on the context — so it costs no extra run. The
    gauntlet already does this and lands ~0.4MB for a 40-second walk.
  - **Keep it short and cheap.** Founder: *"I don't want them to take a long
    time to render, so just do them quickly."* Shoot the beat, not the journey:
    start the recording immediately before the motion and close the context
    immediately after. Playwright only finalises the file on context close.
  - Also send **one mid-motion still**. A clip may not autoplay in every chat
    client; a frame taken part-way through the movement always renders.
- **A number** → say the number in the message. Do not screenshot a terminal.
- **A backend or data change with no visual** → there is no artifact. Say what
  changed and what proves it, in two lines. Do not manufacture a picture;
  screenshotting a JSON file proves nothing and trains him to skim.

---

## Shooting the app itself

Playwright, never the Browser pane — the pane is one per session and parallel
crewmates collide in it. Everything is already wired; see *Proving a visible fix*
in AGENTS.md.

- `E2E_SERVER_PORT` and `VITE_CLIENT_PORT` are env-configurable, so pick a free
  pair rather than the defaults when anything else is running.
- **390x844 and 1440x1000.** He reviews on the phone, so the phone shot is the
  one that matters — but he still ships desktop, so both.
- **Answer the consent banner before shooting** — `denyMarketingConsent(page)`,
  and it must be called BEFORE `page.goto`. A banner in frame wastes half the
  phone viewport and he has ruled on this more than once.
- Write images **outside the worktree**, to `D:\Luvley UI Evidence\<task>\`, or a
  crewmate's sweep takes them with it.

---

## Naming, because the filename is the caption

He is scrolling a thread on a handset. A file called `after-2.png` tells him
nothing. Name every file so it says **what state** and **which viewport**:

```
after-beat2-type-your-prompt-phone-390x844.png
before-pro-spent-desktop-1440x1000.png
```

Then let `SendUserFile`'s caption carry the reading order — "in order: X → Y → Z"
— so he knows what he is looking at without opening anything.

---

## How a message reads

AGENTS.md's *Communication / execution style* still governs; mobile tightens it:

- **Lede first.** What is now true that was not.
- **Send images before explaining them.** He looks, then reads.
- **Batch to four or fewer per message.** More than that scrolls past.
- **A number he can check beats an adjective.** "24 of 24" over "looks good".
- **A correction is the first sentence**, always.
- **Questions go in the ❓ block, at the end, never more than three**, each with a
  recommendation so his answer can be one word. On a phone a decision buried in a
  paragraph is a decision that does not get made.

---

## What NOT to do

- **Never tell him to open localhost, an HTML file, or a folder.** That is the
  whole point.
- **Never use `Start-Process`** on an HTML file — it opens his editor, not a
  browser. (At his desk the answer is an absolute path to `chrome.exe`; on mobile
  there is no answer, so convert instead.)
- **Do not stop and wait for him** on something you can decide. He is not at a
  keyboard. Make the call, say in one clause that you made it, and keep moving.
- **Do not batch everything to the end.** Send each finished piece as it lands so
  he can redirect early — a correction that arrives after four more tasks have
  been built on it is expensive.
- **Do not lower the proof bar.** Mobile changes the FORMAT of evidence, never
  the amount. A before shot is still mandatory for a visible fix, and "I could
  not reproduce it" is still a finding rather than a reason to skip it.
