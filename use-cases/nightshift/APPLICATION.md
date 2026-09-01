# Nightshift — Application kit

## Before you tag Harry

1. Deploy to Vercel (root: `use-cases/nightshift`)
2. Set env vars in Vercel dashboard:
   - `SOLARI_API_KEY`
   - `OPENROUTER_API_KEY`
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL
   - `PORTAL_PUBLIC_URL` = same Vercel URL
3. Run one demo close on production — confirm all three Solari phases complete
4. Share the live URL in build-in-public posts **without** tagging first
5. Get 3+ strangers (or waitlist signups) on the demo
6. **Then** post and tag `@harrychow_` and `@getsolari`

## Deploy (Vercel)

```bash
cd use-cases/nightshift
vercel link
vercel env add SOLARI_API_KEY
vercel env add OPENROUTER_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add PORTAL_PUBLIC_URL
vercel deploy --prod
```

Set `PORTAL_PUBLIC_URL` and `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://nightshift-xxx.vercel.app`). Solari's cloud browser **cannot** reach `localhost`.

## Local dev with Solari

Use ngrok or similar:

```bash
npm run dev
ngrok http 3000
# Set PORTAL_PUBLIC_URL=https://xxxx.ngrok-free.app in .env.local
```

## Draft — X / LinkedIn

> Built **Nightshift** — an unattended clerk for software with no API.
>
> One click: Solari stealth browser logs into a vendor portal → sandbox reconciles 12 invoices (2 mismatches) → desktop files the journal in LibreOffice Calc.
>
> All three Solari primitives in one workflow that actually finishes.
>
> Try it: [YOUR_LIVE_URL]
> Code: [YOUR_GITHUB_URL]
>
> Built with AI, shipped with Solari. @harrychow_ @getsolari

## Draft — build-in-public (pre-tag)

> Shipping Nightshift this week — portal automation for AP close.
>
> Tonight's milestone: Solari browser + sandbox reconcile working. Desktop filing next.
>
> [short screen recording]

## Promo code

`STARTER1MO-MKY4BNDK` at [console.getsolari.com](https://console.getsolari.com)

## GitHub

Fork [solari-sdk/solari-cookbook](https://github.com/solari-sdk/solari-cookbook), add `use-cases/nightshift/`, push to your public account.
