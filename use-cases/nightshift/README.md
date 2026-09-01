# Nightshift

**The clerk for software with no API.**

Nightshift is a production use case built on [Solari](https://getsolari.com): one unattended AP close that chains all three primitives — **browser**, **sandbox**, and **desktop** — with an operator UI, shareable runs, and bring-your-own-portal support.

**Live demo:** https://nightshift-ecru.vercel.app

> **For Harry / Solari team:** see [FOR_HARRY.md](./FOR_HARRY.md) for a full walkthrough of what we built and which APIs we used.  
> **Social posts:** ready-to-copy drafts in [SOCIAL.md](./SOCIAL.md).

---

## What it does

### Demo close (one click)

**Run tonight's AP close** from the home page:

1. **Browser** — stealth login to VendorNet demo portal, collect invoices, session recording
2. **Sandbox** — reconcile PDFs vs books, surface 2 intentional mismatches + charts
3. **Desktop** — file journal in LibreOffice Calc, export work pack
4. **Share** — public gallery entry + copy link to the run

Demo login: `nightshift` / `close2026` at `/portal/login`

### Connect your own portal

Paste any public vendor URL on the home page. Nightshift will:

- Open it in a Solari stealth browser
- **Pause on sign-in** and show a credential form in the operator UI (the live browser view is read-only)
- Sign in, attempt CSV export, reconcile in sandbox, continue the close
- **Save a Solari browser profile** per hostname — future runs reuse the session

---

## Quick start

```bash
cd use-cases/nightshift
cp .env.example .env.local   # SOLARI_API_KEY + OPENROUTER_API_KEY
npm install
npm run dev
```

For local Solari browser access to the demo portal, expose your app publicly (ngrok) and set `PORTAL_PUBLIC_URL` in `.env.local`. See [DEPLOY.md](./DEPLOY.md).

Open [http://localhost:3000](http://localhost:3000).

---

## Solari APIs used

| Phase | SDK | Features |
| --- | --- | --- |
| Portal login | `@solarisdk/browser` | `stealth`, `recording`, `captcha`, **profiles**, Playwright |
| Reconcile | `@solarisdk/sandbox` | `runCode`, `files`, `pause` |
| File | `@solarisdk/desktop` | `open`, `mouse`, `keyboard`, `screenshot`, VNC stream |

---

## Architecture

```
Operator UI → Runbook engine → Solari Browser (portal / BYO + profiles)
                             → Solari Sandbox (reconcile)
                             → Solari Desktop (LibreOffice)
                             → Shareable work pack (Neon Postgres)
```

Long runs execute in the SSE handler (`/api/runs/[id]/events`) with a distributed engine lock. Run state persists in **Neon Postgres** on Vercel.

---

## Deploy

```bash
cd use-cases/nightshift
vercel deploy --prod
```

Env vars and Neon setup: [DEPLOY.md](./DEPLOY.md)

---

## Docs in this folder

| File | Purpose |
| --- | --- |
| [FOR_HARRY.md](./FOR_HARRY.md) | Detailed note for Harry — features, APIs, architecture |
| [SOCIAL.md](./SOCIAL.md) | X / LinkedIn post drafts |
| [DEPLOY.md](./DEPLOY.md) | Vercel + Neon production checklist |
| [APPLICATION.md](./APPLICATION.md) | Application program checklist |

---

## Credits

Promo code `STARTER1MO-MKY4BNDK` at [console.getsolari.com](https://console.getsolari.com).

MIT licensed.
