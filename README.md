# Command Center — deploy to Vercel (GitHub login)

Since you log into Vercel via GitHub, the easiest path is: push this folder to a GitHub repo, then import that repo in the Vercel dashboard. No CLI login needed.

## 1. Push this folder to GitHub

In this folder:

```
git init
git add .
git commit -m "Command center MVP"
```

Create a new empty repo on GitHub (e.g. `command-center`), then:

```
git remote add origin https://github.com/riddickagency/command-center.git
git branch -M main
git push -u origin main
```

(If you'd rather not use git commands, GitHub's "upload files" web UI works too — drag in `index.html`, `package.json`, and the `api` folder.)

## 2. Import into Vercel

1. Go to vercel.com/new — you're already logged in via GitHub, so your repos will be listed.
2. Select the `command-center` repo → Import.
3. Leave all settings as default (no build command needed — it's a static `index.html` plus one serverless function) → Deploy.

## 3. Connect a KV database (this is what makes it cross-device)

1. In the project on Vercel, open the **Storage** tab.
2. Create a new **KV** database (Redis-backed). Free tier is plenty for this.
3. Connect it to this project — Vercel automatically adds the `KV_REST_API_URL` / `KV_REST_API_TOKEN` environment variables for you. No secrets to copy/paste.
4. Go to **Deployments** → redeploy the latest one (so the function picks up the new env vars).

## 4. Use it

Open the deployment URL (e.g. `command-center-yourname.vercel.app`) on your laptop and your phone. Anything you edit — pipeline rows, outreach log, checklists — saves to Vercel KV and shows up on every device. The small dot next to the header text shows sync status (green = saved, gray = connecting, red = offline).

## Notes

- The "Briefing" card is computed from your own data on the page (no AI call) — it's a simple rules-based summary so the MVP doesn't depend on any API key. Happy to wire it back up to an LLM call later if you want that.
- Future edits to the code: push to the same GitHub repo and Vercel redeploys automatically — no need to run any CLI commands.
- This is separate from the Cowork artifact you had before. That one only ever lived on this Mac; this Vercel site is the one that actually syncs across devices. Once you're happy with this, just bookmark the Vercel URL and you can stop using the old artifact.
