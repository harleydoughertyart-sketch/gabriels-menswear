#!/usr/bin/env node
// Tape-measure b-roll, three compositions of the same action: the tailor holds
// BOTH ends of the tape, one hand at the shoulder and one at the wrist, and
// lays it along the whole sleeve. Wider than the chalk macros on purpose — the
// full shoulder-to-wrist run has to read in frame, so depth of field is
// moderate rather than paper-thin.
//
// Stage 1 of 2: heads only. gen5-shots.mjs animates whatever survives review.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const KIE = path.resolve(here, "../../../.claude/skills/scrollcraft/scripts/kie.mjs");
const OUT = path.join(here, "out4");
fs.mkdirSync(OUT, { recursive: true });

const LOOK = `Premium editorial menswear photography, 50mm lens, moderate depth of field so the whole length of the sleeve stays readable while the background falls away. Deep navy worsted suiting, honest wool texture and visible weave. Soft daylight, cool crisp grade of steel blue and ivory, background unrecognisable bokeh. Fine film grain, photographic realism. NOT 3D render, NOT illustration, no CGI, no plastic sheen, no text, no legible numerals, no logos, no face, no head, no eyes.`;

const BOTH_HANDS = `The tailor is holding BOTH ends of the tape at once: one hand pinches the tape against the shoulder seam at the top of the arm, the other hand pinches the far end of the tape down at the wrist beside the cuff. Both hands are clearly visible in frame, one at each end. The cloth tape runs in one continuous straight taut line down the outside of the sleeve, spanning the entire arm from shoulder to wrist, lying flat against the wool with no twist, no loop, no curl, no slack, no sag. It is one single unbroken tape, not two pieces and not doubled back.`;

const jobs = [
  ["u1-both.png", `${LOOK}

A three-quarter view along a client's arm in a deep navy suit jacket, shot from the outside of the arm so the sleeve runs diagonally across the frame from upper left to lower right. ${BOTH_HANDS} The shoulder seam and the tape are sharp, the far background soft.`],

  ["u2-both.png", `${LOOK}

A low side-on view of a client's arm in a deep navy suit jacket, the sleeve running horizontally across the frame. ${BOTH_HANDS} Light rakes along the wool showing the weave, the pale cream tape a clean bright line against the navy.`],

  ["u3-both.png", `${LOOK}

Looking down the length of a client's arm in a deep navy suit jacket from just behind the shoulder, the sleeve receding into the frame toward the wrist. ${BOTH_HANDS} The near hand at the shoulder is closest to camera and sharpest, the far hand at the wrist slightly softer, the tape connecting them in one straight run.`],
];

const todo = jobs.filter(([name]) => !fs.existsSync(path.join(OUT, name)));
console.log(`generating ${todo.length}/${jobs.length} tape heads into out4/`);
let active = 0, i = 0;
const failed = [];
function next() {
  while (active < 3 && i < todo.length) {
    const [name, prompt] = todo[i++];
    active++;
    const p = spawn(process.execPath, [KIE, "still", prompt, path.join(OUT, name), "--ar", "16:9"],
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
