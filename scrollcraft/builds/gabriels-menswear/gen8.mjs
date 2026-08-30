#!/usr/bin/env node
// Four more before-frames in the b3 vein. The note that separates these from
// gen7: the jacket is WORN. A client's arm is inside the sleeve, with the
// shirt cuff showing beneath it and the client's body anchoring the frame.
// b2, b4 and b5 failed on exactly that — they read as loose cloth held up.
//
// Everything else holds: the mark lands about two inches from the cuff edge,
// a real menswear shop sits softly behind, and the cloth is still clean here.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const KIE = path.resolve(here, "../../../.claude/skills/scrollcraft/scripts/kie.mjs");
const OUT = path.join(here, "out6");
fs.mkdirSync(OUT, { recursive: true });

const REAL = `Real photograph, not a render and not an illustration. Shot on a full frame camera, 85mm lens at f2.8, natural daylight from a shop window. Believable human hands with correct anatomy and a natural grip. Documentary realism, unposed. No faces, no heads, no eyes in frame. No text, no legible numbers, no logos, no watermark.`;

const WORN = `The navy suit jacket is BEING WORN by a standing client: his arm is inside the sleeve, filling it out with the natural shape of a real arm, and a crisp white shirt cuff shows just beyond the jacket cuff. Part of the client's body is visible in frame, so this clearly reads as a fitting on a person and never as a loose piece of cloth held up.`;

const SHOP = `Behind them, clearly a menswear shop: suit jackets on a rail, a dress form, shelves of folded shirts, warm wood and soft lamps, thrown well out of focus.`;

const CLEAN = `The navy wool is completely clean: NO chalk mark, no line, no slash, no chalk dust, nothing drawn anywhere on the cloth. The tailor holds a small flat white tailor's chalk between thumb and forefinger near the sleeve end, not yet touching it, while his other hand steadies the cuff.`;

const jobs = [
  ["b6.png", `A tailor at a client's cuff, framed tight on the last few inches of the navy sleeve. The tailor's near hand steadies the cuff from underneath, his other hand brings the chalk toward the cloth. ${WORN} ${CLEAN} ${SHOP} ${REAL}`],

  ["b7.png", `Low three-quarter view along a client's forearm toward the cuff of his navy suit jacket, the sleeve running from upper left down to the cuff at lower right, the jacket's cuff buttons catching the light. The tailor's hands work at the cuff end, chalk held ready. ${WORN} ${CLEAN} ${SHOP} ${REAL}`],

  ["b8.png", `Over-the-shoulder view from behind and above the tailor as he crouches at a standing client's arm, framed on the navy cuff and the white shirt cuff beneath it, chalk poised in his fingers. ${WORN} ${CLEAN} ${SHOP} ${REAL}`],

  ["b9.png", `Side-on close-up of a standing client's arm hanging at his side in a navy suit jacket, the tailor's hands entering frame at the cuff, one turning the cuff slightly, the other holding flat white chalk close to the sleeve end. ${WORN} ${CLEAN} ${SHOP} ${REAL}`],
];

const todo = jobs.filter(([name]) => !fs.existsSync(path.join(OUT, name)));
console.log(`generating ${todo.length}/${jobs.length} worn before-frames into out6/`);
let active = 0, i = 0;
const failed = [];
function next() {
  while (active < 4 && i < todo.length) {
    const [name, prompt] = todo[i++];
    active++;
    const p = spawn(process.execPath, [KIE, "gpt", prompt, path.join(OUT, name), "--ar", "16:9", "--res", "2K"],
      { stdio: ["ignore", "inherit", "inherit"], cwd: here });
    p.on("exit", (code) => {
      active--;
      if (code !== 0) { failed.push(name); console.error("FAILED: " + name); }
      else console.log("done: " + name);
      next();
      if (active === 0 && i >= todo.length) {
        console.log(failed.length ? "FAILURES: " + failed.join(",") : "ALL OK");
        process.exit(failed.length ? 1 : 0);
      }
    });
  }
  if (todo.length === 0) process.exit(0);
}
next();
