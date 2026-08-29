#!/usr/bin/env node
// Round 2: close-up tailoring b-roll set. No interiors, no rooms; every frame
// tight enough that it could be the store's own craft.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const KIE = path.resolve(here, "../../../.claude/skills/scrollcraft/scripts/kie.mjs");
const OUT = path.join(here, "out2");
fs.mkdirSync(OUT, { recursive: true });

const PRE = `Premium close-up menswear photography, shot on a 85mm lens at wide aperture. Extremely shallow depth of field, the background falling away to soft pale blue-grey bokeh with no recognisable environment, no walls, no windows, no room detail. Soft directional daylight from the upper left, gentle natural shadows. Colour grade of crisp white, pale slate blue and deep navy. Fine film grain, photographic realism, honest fabric texture. NOT 3D render, NOT illustration, no CGI, no digital glow, no plastic sheen, no text, no logos, no faces.`;

const FLAT = `Editorial flat-lay product photography for a classic menswear brand, photographed straight from above on a seamless pure white background. One soft even overhead light, near-shadowless with a single faint soft contact shadow under the objects. Colour grade of crisp white and deep navy. Medium-format sharpness, fine grain, photographic realism. NOT 3D render, NOT illustration, no CGI, no plastic sheen, no text, no logos.`;

const jobs = [
  ["h2-hero.png", "16:9", `${PRE}\n\nA tight row of deep navy and slate blue suit jackets on natural wooden hangers, photographed from the side at shoulder height so the shoulders and lapels line up receding to the right, only the nearest lapel in sharp focus. The upper left third of the frame is soft empty pale bokeh, clear negative space for a headline.`],
  ["h2-hero-p.png", "9:16", `${PRE}\n\nVertical composition. A tight row of deep navy suit jackets on wooden hangers seen from the side, shoulders and lapels receding downward to the right, only the nearest lapel sharp. The top third of the frame is soft empty pale bokeh, clear negative space for a headline.`],
  ["h2-turn.png", "16:9", `${PRE}\n\nA rectangle of white tailor's chalk resting on a neatly folded stack of deep navy suiting fabric, photographed close at a slight angle, the chalk's drawn line visible on the top layer of cloth. Subject in the left half of the frame, the right half falling to soft empty pale bokeh.`],
  ["h2-rail-wedding.png", "3:4", `${PRE}\n\nA small white ranunculus boutonniere pinned to the buttonhole of a deep navy suit lapel, photographed very close, the lapel's wool weave sharp, everything else soft. Soft empty bokeh in the upper quarter of the frame.`],
  ["h2-rail-prom.png", "3:4", `${PRE}\n\nA black silk bow tie sitting against a crisp white wing collar and midnight blue satin shawl lapel, photographed very close, the silk texture sharp. Soft empty bokeh in the upper quarter of the frame.`],
  ["h2-rail-work.png", "3:4", `${PRE}\n\nA knitted deep navy tie in a neat four-in-hand knot against a pale blue cotton shirt collar, photographed very close, the knit texture sharp. Soft empty bokeh in the upper quarter of the frame.`],
  ["h2-rail-alterations.png", "3:4", `${PRE}\n\nA deep navy suit sleeve cuff with three fine steel pins set along a chalk fitting line, an ivory measuring tape curling softly out of focus behind it, photographed very close. Soft empty bokeh in the upper quarter of the frame.`],
  ["h2-finishing.png", "3:4", `${FLAT}\n\nA neat flat-lay arrangement: three folded silk ties in deep navy, slate blue and deep teal in a row, one crisp white linen pocket square with a thin navy border, and a pair of round silver cufflinks, arranged with generous even spacing, centred, empty white space around the set.`],
  ["h2-worn.png", "16:9", `${PRE}\n\nA man in a perfectly fitted deep navy suit photographed from behind and slightly to the side at an outdoor wedding, mid-gesture adjusting his shirt cuff, his head turned away so no face is visible. Behind him, soft pale bokeh of white wedding chairs and flowers. The suit's shoulder line and drape are sharp and immaculate. The left third of the frame is soft empty bokeh, negative space for a line of text.`],
];

const todo = jobs.filter(([name]) => !fs.existsSync(path.join(OUT, name)));
console.log(`generating ${todo.length}/${jobs.length} stills`);

const MAX = 4;
let active = 0, i = 0, failed = [];
function next() {
  while (active < MAX && i < todo.length) {
    const [name, ar, prompt] = todo[i++];
    active++;
    const p = spawn(process.execPath, [KIE, "still", prompt, path.join(OUT, name), "--ar", ar], {
      stdio: ["ignore", "inherit", "inherit"], cwd: here,
    });
    p.on("exit", (code) => {
      active--;
      if (code !== 0) { failed.push(name); console.error(`FAILED: ${name}`); }
      else console.log(`done: ${name}`);
      next();
      if (active === 0 && i >= todo.length) {
        console.log(failed.length ? `FAILURES: ${failed.join(", ")}` : "ALL STILLS OK");
        process.exit(failed.length ? 1 : 0);
      }
    });
  }
  if (todo.length === 0) { console.log("nothing to do"); process.exit(0); }
}
next();
