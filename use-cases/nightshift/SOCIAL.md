# Nightshift — social posts

**Live URL:** https://nightshift-ecru.vercel.app  
**Tags:** `@harrychow_` `@getsolari`

**Media folder:** `public/social/` — regenerate with `npm run record-social`

---

## Media library

| Asset | Type | Best for |
| --- | --- | --- |
| `public/social/01-home-hero.png` | image | Post 6, LinkedIn cover |
| `public/social/02-browser-phase.webm` | video | Post 2, thread 6b |
| `public/social/03-sandbox-phase.webm` | video | Post 2, thread 6c |
| `public/social/04-desktop-phase.webm` | video | Post 2, thread 6d |
| `public/social/05-operator-three-pane.png` | image | **Post 4**, LinkedIn |
| `public/social/06-reconcile-mismatches.png` | image | **Post 2**, thread 6c |
| `public/social/07-workflow-montage.webm` | video | **Post 2** (single clip), Post 6 |
| `public/social/08-browser-replay.webm` | video | Post 4, thread 6b |
| `public/social/08-browser-replay.png` | image | Post 4 alt |
| `public/social/09-byo-credentials.png` | image | **Post 3** — capture manually (see below) |

**X upload tips**
- Prefer **video** (`.webm` or `.mp4`) for motion — X autoplays in feed
- **PNG** for static screenshots; crop to 16:9 if needed
- Keep clips **under 30s**; `07-workflow-montage.webm` is the best all-in-one
- Optional GIFs: `CONVERT_GIF=1 npm run record-social` (requires ffmpeg)

**Regenerate from production**
```bash
cd use-cases/nightshift
BASE_URL=https://nightshift-ecru.vercel.app npm run record-social
```

**Manual capture — BYO credentials (`09-byo-credentials.png`)**
1. Start a BYO run to any login page
2. When the gold credential banner appears, screenshot the operator UI
3. Save as `public/social/09-byo-credentials.png`

---

## Posted

### Post 1 — Main launch ✅

```
Built Nightshift — unattended AP close for software with no API.

@getsolari browser → sandbox → desktop in one workflow.

https://nightshift-ecru.vercel.app

@harrychow_
```

**Media (optional add as reply):** attach `07-workflow-montage.webm` or `01-home-hero.png`

---

## Remaining posts (in order)

Post these as **replies to Post 1** (thread) or as standalone follow-ups. All drafts under 280 characters.

---

### Post 2 — Reply / thread (what it actually does)

**Attach:** `07-workflow-montage.webm` ⭐ or stack `02` + `03` + `04` as separate replies

```
What it does:
→ stealth browser logs into vendor portal (recording on)
→ sandbox reconciles invoices, catches mismatches
→ desktop files the journal in LibreOffice Calc

Demo: https://nightshift-ecru.vercel.app
```

**Optional second reply with image:** `06-reconcile-mismatches.png`

---

### Post 3 — BYO portal + profiles

**Attach:** `09-byo-credentials.png` (manual capture) or `02-browser-phase.webm`

```
The hard part isn't scraping vendor portals — it's sign-in.

Nightshift BYO:
→ opens your URL in a @getsolari stealth browser
→ pauses + asks for creds in the UI
→ saves a Solari profile — next run skips login

https://nightshift-ecru.vercel.app
```

---

### Post 4 — Operator UI angle

**Attach:** `05-operator-three-pane.png` ⭐ or `08-browser-replay.webm`

```
Three-pane operator UI:
→ runbook steps
→ live browser + desktop VNC
→ reconcile table + work pack

Shareable run URLs. Browser session replay after each close.

https://nightshift-ecru.vercel.app
```

---

### Post 5 — Short standalone (if not threading)

**Attach:** `01-home-hero.png` or `07-workflow-montage.webm`

```
Software with no API still needs a clerk.

Nightshift = @getsolari browser + sandbox + desktop in one AP close.

https://nightshift-ecru.vercel.app

@harrychow_
```

---

### Post 6 — Build-in-public / milestone

**Attach:** `07-workflow-montage.webm` ⭐ or `01-home-hero.png`

```
Shipped Nightshift this week — AP close for vendor portals that will never ship an API.

All three @getsolari primitives in one typed runbook. Live on Vercel.

Try the demo: https://nightshift-ecru.vercel.app
```

---

## Optional thread (full 🧵)

| Tweet | Copy | Attach |
| --- | --- | --- |
| **6a** opener | `How Nightshift chains @getsolari browser, sandbox + desktop into one AP close 🧵` | `07-workflow-montage.webm` |
| **6b** browser | Phase 1 — Browser… (see below) | `02-browser-phase.webm` or `08-browser-replay.webm` |
| **6c** sandbox | Phase 2 — Sandbox… | `03-sandbox-phase.webm` + `06-reconcile-mismatches.png` |
| **6d** desktop | Phase 3 — Desktop… | `04-desktop-phase.webm` |
| **6e** CTA | Try it… @harrychow_ | `01-home-hero.png` |

**6b — browser**

```
Phase 1 — Browser

Stealth login to a vendor portal. Session recording. Captcha on. Export CSV.

BYO: detect login → prompt for creds → save a Solari profile for next time.
```

**6c — sandbox**

```
Phase 2 — Sandbox

Parse invoice PDFs. Reconcile portal vs books. Surface mismatches with charts.

"Downloaded a CSV and prayed" → exception queue.
```

**6d — desktop**

```
Phase 3 — Desktop

LibreOffice Calc on a live Linux GUI. File the journal. Export XLSX + PDF.

Operator UI streams the desktop while it runs.
```

**6e — CTA**

```
Try it — no signup on the demo:

https://nightshift-ecru.vercel.app

Or connect your own portal URL.

Built for the Solari build-in-public program. @harrychow_
```

---

## LinkedIn (long form)

**Attach:** `05-operator-three-pane.png` + `07-workflow-montage.webm` (LinkedIn accepts video)

```
I built Nightshift — an unattended clerk for accounts payable close on software that has no API.

The workflow chains three Solari products end to end:

Browser — stealth login to a vendor portal, mark invoices received, session recording for audit.

Sandbox — parse PDFs, reconcile against the books, flag mismatches with charts.

Desktop — file the journal in LibreOffice Calc on a live Linux GUI, export XLSX and PDF.

There's an operator UI with live browser snapshots, desktop VNC, step logs, and shareable run URLs. You can also connect your own portal: Nightshift detects sign-in, prompts for credentials, and saves a Solari browser profile so the next run reuses the session.

Live demo: https://nightshift-ecru.vercel.app

Built with AI, shipped with Solari. @harrychow_ @getsolari
```

---

## Suggested schedule

| When | Post | Media |
| --- | --- | --- |
| Now | **Post 2** reply | `07-workflow-montage.webm` |
| +1 day | **Post 3** BYO | `09-byo-credentials.png` (manual) |
| +2–3 days | **Post 4** operator UI | `05-operator-three-pane.png` |
| +1 week | **LinkedIn** | `05-operator-three-pane.png` + montage video |
| Optional | **Thread 6a–6e** | per table above |

---

## Checklist

- [x] Post 1 — main launch
- [x] Social snippets generated (`public/social/`)
- [ ] Post 2 — reply + **`07-workflow-montage.webm`**
- [ ] Post 3 — BYO + **`09-byo-credentials.png`**
- [ ] Post 4 — operator UI + **`05-operator-three-pane.png`**
- [ ] Post 5 — short standalone (optional)
- [ ] LinkedIn long form + media
- [ ] Manual: capture BYO credential banner for Post 3
