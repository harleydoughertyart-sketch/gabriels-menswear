# Gabriel's Menswear Site Handoff

## Active Workspace

Use this folder as the active project:

```powershell
D:\gabriels-menswear
```

The old working folder at `C:\Users\Harley\Documents\New project` is now just the original build workspace.

## Live Site

- Production URL: https://gabriels-menswear.vercel.app
- GitHub repo: https://github.com/harleydoughertyart-sketch/gabriels-menswear
- Vercel project: `gabriels-menswear`
- Vercel project ID: `prj_ffrD7fRQtVbFapn8GNEEQHaGV4Bm`
- Vercel team/org ID: `team_gEI0DmAeJirvGL6sHLO7XHlK`

## Local Preview

This is a plain static HTML/CSS/JS site.

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/index.html
```

## Validation

```powershell
node --check .\script.js
```

The page also contains JSON-LD for local business and FAQ. Keep visible FAQ text and FAQ schema answers in sync.

## Deployment

The folder is linked to the existing Vercel project with `.vercel/project.json`, which is intentionally ignored by Git.

The Vercel project is connected to the GitHub repo. Pushes to `main` should trigger Vercel deployments.

Manual production deploy:

```powershell
npx vercel deploy --prod
```

GitHub is pushed on `main`. Once Vercel has a GitHub Login Connection enabled for this account, connect the repo to the Vercel project from this folder:

```powershell
npx vercel git connect https://github.com/harleydoughertyart-sketch/gabriels-menswear --yes
```

Use manual production deploys only when you need to force a deploy outside the Git flow.
