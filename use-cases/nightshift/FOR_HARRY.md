# Nightshift — note for Harry

**Live demo:** [https://nightshift-ecru.vercel.app](https://nightshift-ecru.vercel.app)  
**Repo path:** `use-cases/nightshift/` in [solari-cookbook](https://github.com/solari-sdk/solari-cookbook)  
**Author:** Ali — built as a real use case for the Solari application / build-in-public program

---

## One-liner

**Nightshift is an unattended clerk for software with no API** — one click runs a full accounts-payable close across Solari **browser**, **sandbox**, and **desktop**.

---

## Why this exists

Founders and ops teams still log into vendor portals, download CSVs, reconcile in spreadsheets, and file in desktop apps because there is no API. Nightshift shows what Solari makes possible when you chain all three primitives into one workflow that actually finishes — with an operator UI, shareable run URLs, and a path to bring your own portal.

---



## What we built



### 1. Demo AP close (one click)

From the home page, **Run tonight's AP close** kicks off a typed runbook:


| Phase       | Solari product       | What happens                                                                                                                                  |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Browser** | `@solarisdk/browser` | Stealth browser + recording + captcha. Logs into a hostile **VendorNet** demo portal (`/portal/login`), marks invoices received, exports CSV. |
| **Sandbox** | `@solarisdk/sandbox` | Parses PDFs, reconciles portal vs books, surfaces **2 intentional mismatches**, generates exception charts.                                   |
| **Desktop** | `@solarisdk/desktop` | Resumes from snapshot, opens LibreOffice Calc, files the journal, exports XLSX + PDF pack. Live VNC stream in the operator UI.                |
| **Pack**    | —                    | Publishes a shareable work pack (reconcile table, artifacts, browser replay link).                                                            |


Demo portal credentials (seeded): `nightshift` / `close2026`

### 2. Connect your own portal (BYO)

**Connect a portal** on the home page accepts any public vendor URL. The runbook:

1. Opens the URL in a Solari stealth browser
2. Detects a login screen
3. **Pauses and prompts the operator for credentials** (you cannot control the cloud browser directly — credentials go through a banner in the Nightshift UI)
4. Signs in, navigates with LLM-assisted goals, attempts CSV export
5. **Saves a Solari browser profile** (`nightshift-{hostname}`) so the next run to that portal reuses the session
6. Falls back to seed CSV only if export fails (logged clearly)

This uses `@solarisdk/browser` **profiles** — `profiles.create`, `profiles.save(storageState)`, and `launch({ profileId })` on subsequent runs. Profile IDs are mapped by hostname in Neon Postgres (`portal_profiles` table).

### 3. Operator UI

Three-pane layout (runbook · live · work pack):

- Dark theme, mobile tab layout
- Live browser screenshots + desktop VNC stream
- Step log with high-contrast mismatch rows
- Browser session replay after the browser phase completes
- Pause / resume for human-in-the-loop
- Portal credential banner when BYO hits sign-in



### 4. Production infra

- **Vercel** — Next.js App Router, SSE for long-running runbook engine (`maxDuration: 300`)
- **Neon Postgres** — run state, analytics, waitlist, engine locks, portal profile mappings (required on Vercel; local dev uses `.data/`)
- **OpenRouter** — LLM goals for BYO portal navigation
- **Distributed lock** — one engine per run across serverless instances

---



## Solari APIs used (concrete)

```typescript
// Browser — stealth login, recording, profiles
await solari.launch({ stealth: true, recording: true, captcha: true, profileId });
await solari.profiles.create({ name: `nightshift-${hostname}` });
await solari.profiles.save(profileId, await page.context().storageState());
await solari.sessions.getReplayUrl(sessionId);

// Sandbox — reconcile + charts
await sandbox.runCode(...);
await sandbox.files.write(...);
await sandbox.pause();

// Desktop — LibreOffice filing + VNC
await desktop.open(...);
await desktop.mouse.click(...);
await desktop.keyboard.type(...);
await desktop.pause(); // stream only while running
```

---



## Architecture

```
Home / Operator UI
       │
       ▼
POST /api/runs  ──►  Neon Postgres (run JSON)
       │
       ▼
GET /api/runs/[id]/events  (SSE)
       │
       ▼
Runbook engine (engine.ts)
       ├── Browser phase  → Solari Browser (demo portal or BYO + profiles)
       ├── Sandbox phase  → reconcile + charts
       ├── Desktop phase  → LibreOffice + stream
       └── Pack phase     → public gallery + share URL
```

Key files:

- `src/lib/runbook/engine.ts` — main runbook
- `src/lib/runbook/byo-browser.ts` — external portal flow
- `src/lib/runbook/portal-login.ts` — login detection, credential wait, profile save
- `src/components/PortalLoginPrompt.tsx` — operator credential UI
- `src/lib/store.ts` + `src/lib/db.ts` — persistence

---



## Try it

1. **Demo:** [https://nightshift-ecru.vercel.app](https://nightshift-ecru.vercel.app) → **Run tonight's AP close**
2. **BYO:** Same page → **Connect a portal** → e.g. `https://hylandcontentportal.demo.jadu.net/account/signin` → enter your credentials when the gold banner appears
3. **Replay:** After browser phase, **Watch browser replay** on the run page

---



## What we'd love from Solari

- This is meant as a **cookbook-grade use case** — feedback on API ergonomics (profiles, replay polling, desktop stream lifecycle) is welcome
- Happy to iterate on the demo for docs, launch, or case study
- Built with promo code `STARTER1MO-MKY4BNDK` — usage is real (browser + sandbox + desktop sessions on production)

---



## Deploy / env

See [DEPLOY.md](./DEPLOY.md). Required env vars on Vercel:

- `SOLARI_API_KEY`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_APP_URL` / `PORTAL_PUBLIC_URL` → production URL
- `POSTGRES_URL` → Neon (linked via Vercel Storage)

```bash
cd use-cases/nightshift
npm install
vercel deploy --prod
```

---

Thanks for building Solari — this was the most fun "no API" problem to automate.

— Ali