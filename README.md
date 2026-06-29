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

## 3. Create a free Redis database on Upstash (this is what makes it cross-device)

Vercel's own "KV" product now runs through a paid Marketplace plan, so we're going straight to the source instead — Upstash's free tier (500K commands/month, 256MB) is more than enough for this.

1. Go to upstash.com and sign up (free — GitHub login works there too).
2. Create a new **Redis** database. Any region close to you is fine.
3. On the database page, find the **REST API** section and copy the two values shown: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
4. Back in your Vercel project, go to **Settings → Environment Variables** and add both:
   - `UPSTASH_REDIS_REST_URL` → paste the URL
   - `UPSTASH_REDIS_REST_TOKEN` → paste the token
5. Go to **Deployments** → redeploy the latest one (so the function picks up the new env vars).

## 4. Use it

Open the deployment URL (e.g. `command-center-yourname.vercel.app`) on your laptop and your phone. Anything you edit — pipeline rows, outreach log, checklists — saves to Upstash and shows up on every device. The small dot next to the header text shows sync status (green = saved, gray = connecting, red = offline).

## Notes

- The "Briefing" card is computed from your own data on the page (no AI call) — it's a simple rules-based summary so the MVP doesn't depend on any API key. Happy to wire it back up to an LLM call later if you want that.
- Future edits to the code: push to the same GitHub repo and Vercel redeploys automatically — no need to run any CLI commands.
- This is separate from the Cowork artifact you had before. That one only ever lived on this Mac; this Vercel site is the one that actually syncs across devices. Once you're happy with this, just bookmark the Vercel URL and you can stop using the old artifact.
