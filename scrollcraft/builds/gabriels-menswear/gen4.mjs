#!/usr/bin/env node
// Chalk-mark retake. mv1 failed because the model drew a decorative starburst:
// radiating lines from a point, which no tailor draws. Real notation, per
// Articles of Style's alterations guide and Sew Show Ep.75 on shoulder fitting:
//   - marks are SMALL, thin and few; "small marks rather than big chalk lines"
//   - a straight line marks the NEW seam line, drawn parallel to the old seam
//   - a cross is a reference point; a double horizontal "hash" means let-out
//   - the chalk is a flat block held edge-on, not a stick held like a pencil
// So: one short straight line beside the sleevehead seam, one small cross, stop.
//
// Stills only. Look at them, pick the winner, THEN animate with gen4.mjs shots.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const KIE = path.resolve(here, "../../../.claude/skills/scrollcraft/scripts/kie.mjs");
const OUT = path.join(here, "out4");
fs.mkdirSync(OUT, { recursive: true });

// Shared look. Matches the site's existing macro b-roll: no faces, no room.
const LOOK = `Premium macro menswear photography, 100mm lens, extremely shallow depth of field. Deep navy worsted suiting, honest wool texture and visible weave. Soft daylight, cool crisp grade of steel blue and ivory, background falling to unrecognisable bokeh. Fine film grain, photographic realism. NOT 3D render, NOT illustration, no CGI, no plastic sheen, no text, no logos, no face, no eyes, no head.`;

// The mark itself, stated the same way every time so the model cannot drift.
const MARK_RULES = `The chalk marking must be exactly as a working tailor marks cloth: THIN, SMALL, PRECISE and SPARSE. Flat rectangular white tailor's chalk held edge-on between thumb and two fingertips, the worn edge touching the cloth. Absolutely NO radiating lines, NO starburst, NO asterisk, NO fan of lines from a single point, NO arcs, NO curves, NO circles, NO scribble, NO hatching, NO writing, NO measurements, NO repeated parallel lines.`;

const jobs = [
  // ── Shoulder: one straight line beside the sleevehead seam, plus one cross.
  ["s1-shoulder.png", `${LOOK}

Extreme close-up of a tailor's hand marking the shoulder of a deep navy suit jacket. Exactly ONE short dead-straight white chalk line, roughly two inches long, runs parallel to the sleevehead seam where the sleeve joins the shoulder, set about a finger's width inside it. Beside that line sits ONE small neat cross made of two short straight strokes. That is the complete set of marks on the garment: one straight line and one small cross, nothing else anywhere. ${MARK_RULES}`],

  ["s2-shoulder.png", `${LOOK}

Macro shot from slightly behind and above the shoulder of a deep navy suit jacket on a tailor's dress form. A tailor's hand rests flat on the cloth, smoothing it, while the other hand holds flat white chalk edge-on and has just drawn ONE single straight short chalk line following the sleevehead seam line, with ONE small cross beside it. Only those two marks exist. The shoulder seam and the chalk line run cleanly parallel. ${MARK_RULES}`],

  // ── Sleeve: one straight line at the cuff end, nothing else at all.
  ["s3-sleeve.png", `${LOOK}

Extreme close-up of the end of a deep navy suit jacket sleeve near the cuff. A tailor's fingers steady the cuff while flat white chalk draws ONE single dead-straight chalk line straight across the sleeve, square to the sleeve's length, marking a new shortened hem. That one line is the only mark in the frame. No cross, no second line, no hash marks, nothing else. ${MARK_RULES}`],

  ["s4-sleeve.png", `${LOOK}

Macro shot of a tailor's hand pinching and smoothing the cuff end of a deep navy suit jacket sleeve, the other hand laying ONE single short straight white chalk line across the sleeve just above the cuff. Exactly one straight line, drawn once, crisp and thin. Nothing else is marked anywhere on the sleeve. ${MARK_RULES}`],
];

const todo = jobs.filter(([name]) => !fs.existsSync(path.join(OUT, name)));
console.log(`generating ${todo.length}/${jobs.length} stills into out4/`);
const MAX = 4;
let active = 0, i = 0;
const failed = [];
function next() {
  while (active < MAX && i < todo.length) {
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
