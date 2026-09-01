# Nightshift — Production

**Live URL:** https://nightshift-ecru.vercel.app

**Vercel project:** [alihaggag11s-projects/nightshift](https://vercel.com/alihaggag11s-projects/nightshift)

## Required env vars (Vercel → Settings → Environment Variables)

Add these for **Production** (if not already set):

| Variable | Value |
|----------|-------|
| `SOLARI_API_KEY` | Your `slr_live_…` key |
| `OPENROUTER_API_KEY` | Your OpenRouter key |
| `NEXT_PUBLIC_APP_URL` | `https://nightshift-ecru.vercel.app` |
| `PORTAL_PUBLIC_URL` | `https://nightshift-ecru.vercel.app` |
| `POSTGRES_URL` | Auto-added when you connect **Neon Postgres** (see below) |

### Connect Neon Postgres (required for runs to persist)

Vercel serverless instances do not share `/tmp`. Connect Neon so runs survive across requests:

1. [Vercel project → Storage](https://vercel.com/alihaggag11s-projects/nightshift/stores)
2. **Create Database / Store** → **Neon Postgres**
3. Link to **Production**, **Preview**, and **Development**
4. Click **Connect to Project** if not already linked
5. Redeploy (env var `POSTGRES_URL` is injected automatically)

Tables are created automatically on first request (`runs`, `analytics_events`, `waitlist`, `engine_locks`).

After adding secrets, redeploy:

```bash
cd use-cases/nightshift
vercel deploy --prod
```

Local dev without `POSTGRES_URL` uses `.data/` on disk.

## Verify

1. Open https://nightshift-ecru.vercel.app
2. Click **Run tonight's AP close**
3. Confirm run completes (browser → sandbox → desktop → work pack)
