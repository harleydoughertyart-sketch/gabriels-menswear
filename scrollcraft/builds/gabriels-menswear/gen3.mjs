#!/usr/bin/env node
// Peak montage variations: 3 sets x 4 beats. Macro, no store, no faces;
// final beat = the suit at a wedding, no person.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const KIE = path.resolve(here, "../../../.claude/skills/scrollcraft/scripts/kie.mjs");
const OUT = path.join(here, "out3");
fs.mkdirSync(OUT, { recursive: true });

const BASE = `Extremely shallow depth of field, macro to close-up, backgrounds falling to soft bokeh with no recognisable room detail. Fine film grain, photographic realism, honest fabric and metal texture. NOT 3D render, NOT illustration, no CGI, no plastic sheen, no text, no logos, no faces.`;

const A = `Premium macro menswear photography, 85mm lens. Bright airy daylight, soft shadows, colour grade of crisp white, pale slate blue and deep navy. ${BASE}`;
const B = `Premium macro menswear photography inside a luxury tailor's atelier, 85mm lens. Warm golden window light, deep navy with warm oak and amber bokeh. ${BASE}`;
const C = `Premium editorial macro menswear photography, 100mm lens. Cool crisp morning light, high micro-contrast, colour grade of steel blue, ivory and deep navy. ${BASE}`;

const jobs = [
  // SET A - bright & airy
  ["a1-chalk.png", A, `A tailor's hand drawing a crisp white chalk line along a deep navy suit lapel laid flat, fingertips and chalk edge sharp, everything else soft.`],
  ["a2-tiebar.png", A, `A deep teal silk tie held by a slim brushed-silver tie bar against a crisp white shirt, photographed extremely close, the silk weave and metal edge razor sharp.`],
  ["a3-cufflink.png", A, `A round polished silver cufflink being fastened through a crisp white french cuff, extremely close, the cotton weave and metal shine sharp, soft pale bokeh.`],
  ["a4-wedding.png", A, `A deep navy suit on a natural wooden hanger, hanging from the back of a white folding chair in the front row of an outdoor wedding, rows of white chairs and white flowers in soft bokeh behind, bright airy daylight, no people anywhere.`],
  // SET B - golden shop glow
  ["b1-chalk.png", B, `A tailor's hand drawing a white chalk fitting line across deep navy suiting on a warm oak table, chalk dust catching the light, fingertips sharp, warm bokeh behind.`],
  ["b2-cufflinks.png", B, `A pair of round silver-and-navy cufflinks resting on folded deep navy suiting fabric, extremely close, warm light glinting off the polished metal, golden bokeh behind.`],
  ["b3-boutonniere.png", B, `A tailor's hands pinning a small white boutonniere to a deep navy lapel, extremely close on the flower and pin, warm golden light, everything else soft.`],
  ["b4-wedding.png", B, `A deep navy suit draped carefully over the back of a wooden chiavari chair at a golden-hour outdoor wedding, string lights and white florals in warm soft bokeh behind, no people anywhere.`],
  // SET C - crisp editorial cool
  ["c1-chalk.png", C, `A tailor's hand pressing a flat chalk rectangle along a navy shoulder seam, extremely close, cool crisp light, the weave and chalk line razor sharp, steel-blue bokeh.`],
  ["c2-tieknot.png", C, `A perfect four-in-hand knot in a deep teal tie with a slim silver tie bar, against a pale blue shirt, photographed straight on and extremely close, every thread sharp.`],
  ["c3-square.png", C, `A crisp white pocket square with a navy border being folded by two hands, extremely close on the fold and fingertips, cool morning light, soft steel bokeh.`],
  ["c4-wedding.png", C, `A deep navy suit on a brass valet stand beside a tall white floral arrangement at an elegant indoor wedding venue, cool morning window light, marble and florals in soft bokeh, no people anywhere.`],
];

const todo = jobs.filter(([name]) => !fs.existsSync(path.join(OUT, name)));
console.log(`generating ${todo.length}/${jobs.length}`);
const MAX = 4;
let active = 0, i = 0, failed = [];
function next() {
  while (active < MAX && i < todo.length) {
    const [name, pre, scene] = todo[i++];
    active++;
    const p = spawn(process.execPath, [KIE, "still", pre + "\n\n" + scene, path.join(OUT, name), "--ar", "16:9"], { stdio: ["ignore", "inherit", "inherit"], cwd: here });
    p.on("exit", (code) => {
      active--;
      if (code !== 0) { failed.push(name); console.error("FAILED: " + name); } else console.log("done: " + name);
      next();
      if (active === 0 && i >= todo.length) { console.log(failed.length ? "FAILURES: " + failed.join(",") : "ALL OK"); process.exit(failed.length ? 1 : 0); }
    });
  }
  if (todo.length === 0) process.exit(0);
}
next();
