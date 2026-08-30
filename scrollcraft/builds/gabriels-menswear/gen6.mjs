#!/usr/bin/env node
// Opening frames for the chalk shot, aiming higher than s3-clean.png. That one
// is correct but ordinary: flat light, plain angle. These three go after a
// frame worth holding on — light that models the wool, a composition with a
// diagonal in it, and the chalk poised rather than parked.
//
// All three open CLEAN. The mark arrives during the shot, so no chalk line
// appears in any of these frames.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const KIE = path.resolve(here, "../../../.claude/skills/scrollcraft/scripts/kie.mjs");
const OUT = path.join(here, "out5");
fs.mkdirSync(OUT, { recursive: true });

const LOOK = `Premium editorial menswear photography, 85mm lens, shallow depth of field. Deep navy worsted suiting with honest wool texture and clearly visible weave, the nap catching light. Fine film grain, true photographic realism, the look of a real cinema camera. NOT 3D render, NOT illustration, no CGI, no plastic sheen, no text, no logos, no face, no head, no eyes.`;

const CLEAN = `The wool is completely clean and unmarked: there is NO chalk line, no chalk mark, no chalk dust and no trace of any drawing anywhere on the cloth. The flat rectangular white tailor's chalk is held edge-on between thumb and two fingertips, poised just clear of the fabric, about to touch but not yet touching.`;

const jobs = [
  ["c1-open.png", `${LOOK}

Extreme close-up of a tailor's hand at the cuff end of a navy suit jacket sleeve, raking side light skimming across the weave so the wool reads as fabric rather than flat colour, a bright rim along the folded cuff edge and deep soft shadow behind. The sleeve runs on a diagonal through the frame. ${CLEAN} The chalk edge and the fingertips are the sharpest things in the picture.`],

  ["c2-open.png", `${LOOK}

Close-up of a tailor's two hands at a navy sleeve: one hand turning and steadying the cuff, thumb pressed into the wool so the cloth gathers slightly around it, the other bringing the flat white chalk in toward the sleeve. Warm low window light from the left, cool shadow on the right, a quiet workroom dissolving to bokeh behind. ${CLEAN}`],

  ["c3-open.png", `${LOOK}

Tight overhead-angled shot looking down onto a navy jacket sleeve laid across the tailor's forearm, the cuff and the sleeve seam both running through frame as clean parallel lines. One hand steadies the cloth, the other holds flat white chalk edge-on just above the wool. Crisp cool daylight, high micro-contrast, the weave razor sharp. ${CLEAN}`],
];

const todo = jobs.filter(([name]) => !fs.existsSync(path.join(OUT, name)));
console.log(`generating ${todo.length}/${jobs.length} chalk opening frames into out5/`);
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
