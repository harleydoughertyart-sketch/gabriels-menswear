---
name: web-desktop-sync
description: Keep this repo's Vite web app and Electron desktop wrapper functionally synced. Use when changing shared app behavior, polishing bugs found through the desktop icon, updating the Electron wrapper, preparing a push/PR that must keep web and desktop aligned, adding future database-backed web features, or deciding whether code belongs in client/server versus electron/scripts.
---

# Web/Desktop Sync

Use this skill to keep the desktop icon and future sellable web app moving from one source of truth.

## Core Rule

Do not maintain duplicate web and desktop implementations. The Electron desktop app wraps the same `client/` and `server/` code as the browser app.

- Put user-facing app behavior in `client/`.
- Put API, provider, persistence, and database-ready behavior in `server/` or shared modules.
- Put only native shell behavior in `electron/` and desktop helper scripts: window chrome, menu, fullscreen shortcuts, app icon, packaging, shortcut launchers, local runtime boot.

If a bug is discovered while using the desktop icon, first assume the fix belongs in shared web code unless the bug is caused by Electron window/runtime behavior.

## Placement Decision

Use this decision order before editing:

1. If the change affects what users see or do inside the studio, edit shared `client/` code.
2. If the change affects `/api/*`, image generation, settings, persistence, auth, billing, or future database state, edit shared `server/` code.
3. If the change affects both UI and API, keep the contract shared and update both `client/` and `server/`.
4. If the change only affects desktop launch/window/package behavior, edit `electron/`, `scripts/launchLiveDesktop.ps1`, `scripts/createDesktopShortcut.mjs`, or packaging config.
5. If code is only in `electron/` but would matter in the browser, rehome it into shared code instead of copying it later.

## Workflow

1. Inspect `git status --short` before starting. Leave unrelated user/agent changes alone.
2. Make the smallest shared-code change that fixes the behavior for both surfaces.
3. Add Electron-only code only when the browser cannot or should not own that behavior.
4. Run the relevant focused tests first, then `npm run build --prefix client` for shared web confidence.
5. Refresh the live desktop test path. Prefer the live desktop helper/skill when available; otherwise use the desktop icon launcher or `npm run desktop:dev`.
6. If the shortcut/launcher changed, run `npm run desktop:shortcut` on Windows.
7. Use `npm run desktop:build` only for packaged/installer testing, not as the normal live-sync path.
8. In the final handoff or PR notes, state whether the change is shared web+desktop or intentionally desktop-only.

## Multi-Agent Safety

- Never use reset/clean/checkout to resolve sync problems.
- Never overwrite unrelated files touched by another chat.
- Do not kill shared Vite/backend processes just to refresh Electron. The live launcher may replace this repo's Electron dev wrapper, but shared servers should be reused when healthy.
- Treat `.tmp/`, `client/dist/`, and `dist-desktop/` as generated/local output unless the user explicitly asks to commit them.
- If a build fails because of unrelated work from another agent, report the blocker and keep your own diff scoped.

## Push/PR Rule

There is no separate "copy to web app" step. A push keeps web and desktop synced when the committed behavior lives in shared `client/`/`server/` code and Electron remains only a wrapper.

Before pushing an Electron-related branch:

- Review `git diff --name-only` and confirm web-relevant behavior is not trapped in `electron/`.
- Run the shared web build.
- Refresh the live desktop path.
- Prefer small, coherent pushes over large mixed pushes; large pushes make review and regression isolation worse.

## Future Database Rule

When adding database-backed features, put data models, API contracts, migrations, and auth/billing boundaries in shared web/server architecture. The desktop wrapper should call the same app/API paths as the browser so commercialization later does not require a rewrite.
