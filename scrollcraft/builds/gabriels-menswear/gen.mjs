#!/usr/bin/env node
// Batch still generation for the Gabriel's Menswear build.
// Spawns kie.mjs per asset with bounded concurrency; skips files that exist.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const KIE = path.resolve(here, "../../../.claude/skills/scrollcraft/scripts/kie.mjs");
const OUT = path.join(here, "out");
fs.mkdirSync(OUT, { recursive: true });

const PRE = `Editorial menswear photography for a classic tailor's shop, shot on medium format with a 50mm lens. Bright airy daylight through large windows, white walls and pale surfaces, one soft key light with a large white bounce, gentle soft shadows. Deep navy, slate blue and crisp white garments are the only strong colour; colour grade of crisp white, cool pale grey-blue and deep navy. Shallow depth of field, fine film grain, photographic realism. NOT 3D render, NOT clay, NOT illustration, no CGI, no digital glow, no plastic sheen, no text, no signage, no logos, no people's faces.`;

const FLAT = `Editorial flat-lay product photography for a classic menswear tailor, photographed straight from above on a seamless pure white background. One soft even overhead light, near-shadowless with a single faint soft contact shadow under the object. Colour grade of crisp white and deep navy. Medium-format sharpness, fine grain, photographic realism. NOT 3D render, NOT illustration, no CGI, no plastic sheen, no text, no logos.`;

const jobs = [
  // hero
  ["01-hero.png", "16:9", `${PRE}\n\nA long wall rack of deep navy and slate blue tailored suit jackets on wooden hangers in a bright white menswear shop, the rack receding in gentle perspective from the right foreground toward soft focus at the left rear. Polished pale wood floor. Large soft empty white wall across the upper left of the frame, clear negative space for a headline.`],
  ["01-hero-p.png", "9:16", `${PRE}\n\nVertical composition. A rack of deep navy and slate blue tailored suit jackets on wooden hangers along the right edge of a bright white menswear shop, pale wood floor at the bottom. The upper half of the frame is soft empty white wall, clear negative space for a headline.`],
  // act 3 turn
  ["03-turn.png", "16:9", `${PRE}\n\nA tailor's worktable near a bright window: a folded length of deep navy suiting fabric, a wooden ruler, tailor's chalk and a spool of navy thread arranged at the left of the frame. The right half of the frame is soft bright empty space.`],
  // act 6 macro
  ["06-macro.png", "16:9", `${PRE}\n\nExtreme macro close-up of deep navy herringbone suit fabric with a fine white tailor's chalk fitting line across it and a threaded needle resting in the weave, softly backlit so the texture glows. Razor-thin plane of focus. The left third of the frame falls to soft bright out-of-focus empty space.`],
  // assembly pieces (flat lays on pure white)
  ["piece-jacket.png", "3:4", `${FLAT}\n\nA single deep navy tailored two-button suit jacket, buttoned, sleeves neatly arranged, laid perfectly flat, centred, filling most of the frame.`],
  ["piece-shirt.png", "3:4", `${FLAT}\n\nA crisp white dress shirt with a spread collar, buttoned, folded neatly with the collar at the top, laid perfectly flat, centred. Soft grey contact shadows clearly defining the collar, placket and folds against the white background.`],
  ["piece-tie.png", "3:4", `${FLAT}\n\nA silk necktie in deep teal blue with a subtle fine woven texture, folded in one elegant loose S-curve, laid flat, centred.`],
  ["piece-square.png", "3:4", `${FLAT}\n\nA crisp white linen pocket square with a thin deep navy border, pressed and folded into a neat square, laid flat, centred, generous empty white space around it.`],
  ["piece-tape.png", "3:4", `${FLAT}\n\nA tailor's ivory cloth measuring tape with navy markings, loosely coiled with one end trailing, laid flat, centred, generous empty white space around it.`],
  // rail cards
  ["rail-wedding.png", "3:4", `${PRE}\n\nA deep navy three-piece wedding suit with a white shirt and pale blue tie on a tailor's dress form, a small white boutonniere on the lapel, in a bright white studio. The form stands centred and low in the frame, soft empty white space above.`],
  ["rail-prom.png", "3:4", `${PRE}\n\nA midnight blue tuxedo jacket with satin shawl lapels and a black bow tie on a wooden hanger against a pale blue seamless background, hanging centred and low, soft empty space above.`],
  ["rail-work.png", "3:4", `${PRE}\n\nA slate blue blazer with a light blue shirt and knitted navy tie on a tailor's dress form in a bright white studio, form centred and low in the frame, soft empty space above.`],
  ["rail-alterations.png", "3:4", `${PRE}\n\nA tailor's hands pinning the cuff of a deep navy suit sleeve on a dress form, close crop on the hands and sleeve, no face visible, a measuring tape draped over the form's shoulder, bright soft daylight, empty pale space in the upper third.`],
  // finishing pieces
  ["07-accessories.png", "16:9", `${PRE}\n\nSilk ties in shades of deep navy, slate and teal blue with white linen pocket squares arranged in neat tidy rows inside a pale oak haberdashery drawer, photographed from directly above. A band of soft empty pale wood along the top edge of the frame.`],
];

const todo = jobs.filter(([name]) => !fs.existsSync(path.join(OUT, name)));
console.log(`generating ${todo.length}/${jobs.length} stills`);

const MAX = 5;
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
  if (todo.length === 0) { console.log("ALL STILLS OK (nothing to do)"); process.exit(0); }
}
next();
