#!/usr/bin/env node
// Five compositions of the same action, on GPT Image 2 at 2K.
//
// The brief, and every past failure it is written against:
//   - the mark sits about TWO INCHES from the cuff edge, not six or eight up
//     the sleeve, which is where every earlier generation put it
//   - the mark is a QUARTER INCH slash, parallel to the cuff edge. Not a line
//     across the sleeve, not wrapping round it, not a cross, not a starburst
//   - a real menswear shop behind, softly out of focus, not a void
//   - he holds the cuff and smooths it, then makes one quick small mark
//
// These are the BEFORE frames: clean cloth, chalk in hand, no mark yet.
// gen7-after.mjs derives the matching AFTER frame from each, so the pair can
// drive a first-frame/last-frame video with nothing else moving.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const KIE = path.resolve(here, "../../../.claude/skills/scrollcraft/scripts/kie.mjs");
const OUT = path.join(here, "out6");
fs.mkdirSync(OUT, { recursive: true });

const REAL = `Real photograph, not a render and not an illustration. Shot on a full frame camera, 85mm lens at f2.8, natural daylight from a shop window. Believable human hands with correct anatomy and a natural grip. Documentary realism, unposed, the ordinary competence of someone who does this every day. No faces, no heads, no eyes in frame. No text, no legible numbers, no logos, no watermark.`;

const SHOP = `Behind him, clearly a menswear shop: suit jackets on a rail, a dress form, shelves of folded shirts, a long cutting table, warm wood and soft lamps, all thrown well out of focus so nothing behind competes with the hands.`;

const CLEAN = `The navy wool is completely clean: there is NO chalk mark, no line, no slash, no chalk dust and no drawing of any kind anywhere on the cloth. He holds a small flat white tailor's chalk between thumb and forefinger, close to the cloth but not yet touching it. His other hand holds and smooths the cuff.`;

const jobs = [
  ["b1.png", `A tailor at the very end of a navy suit jacket sleeve, framed tight on the last few inches of the sleeve and the cuff edge. Three-quarter view from the outside of the arm. ${CLEAN} ${SHOP} ${REAL}`],

  ["b2.png", `Close-up from slightly above, looking down at the end of a navy suit jacket sleeve resting over the tailor's forearm, the cuff edge running across the lower part of the frame. ${CLEAN} ${SHOP} ${REAL}`],

  ["b3.png", `A tailor kneeling at a client's arm, framed tight on the cuff end of a navy suit sleeve with the client's white shirt cuff just showing beneath it. Side-on view. ${CLEAN} ${SHOP} ${REAL}`],

  ["b4.png", `The end of a navy suit jacket sleeve held up slightly by the tailor, cuff edge sharp and near the centre of the frame, the sleeve running back into soft focus. ${CLEAN} ${SHOP} ${REAL}`],

  ["b5.png", `Very tight macro on the cuff end of a navy suit jacket sleeve, the folded cuff edge crossing the frame as a clean line, the tailor's fingers steadying the cloth just behind it. ${CLEAN} ${SHOP} ${REAL}`],
];

const todo = jobs.filter(([name]) => !fs.existsSync(path.join(OUT, name)));
console.log(`generating ${todo.length}/${jobs.length} before-frames into out6/`);
let active = 0, i = 0;
const failed = [];
function next() {
  while (active < 5 && i < todo.length) {
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
