/* The real deps for api/*.mjs: the environment, fetch, the clock, ids, timers and the log. */
import { randomUUID } from 'node:crypto';

export function live() {
  return {
    env: name => String(process.env[name] ?? '').trim(),
    fetch: (...args) => fetch(...args),
    now: () => new Date(),
    uuid: () => randomUUID(),
    sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
    log: (...args) => console.log(...args),
  };
}
