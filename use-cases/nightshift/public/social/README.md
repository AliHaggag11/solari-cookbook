# Social media snippets

Generated assets for X / LinkedIn posts. Re-run after UI changes:

```bash
cd use-cases/nightshift
npm run record-social

# optional GIFs (requires ffmpeg)
CONVERT_GIF=1 npm run record-social
```

Production capture (recommended):

```bash
BASE_URL=https://nightshift-ecru.vercel.app npm run record-social
```

## Files

| File | Use for |
| --- | --- |
| `01-home-hero.png` | Post 1 (if re-posting), Post 6, LinkedIn cover |
| `02-browser-phase.webm` / `.gif` | Post 2, thread 6b |
| `03-sandbox-phase.webm` / `.gif` | Post 2, thread 6c |
| `04-desktop-phase.webm` / `.gif` | Post 2, thread 6d |
| `05-operator-three-pane.png` | Post 4, LinkedIn |
| `06-reconcile-mismatches.png` | Post 2 reply, thread 6c |
| `07-workflow-montage.webm` / `.gif` | Post 2, Post 6 (best single clip) |
| `08-browser-replay.webm` / `.png` | Post 4, thread 6b |

**X tip:** Upload `.webm` or `.gif` directly. Clips under 30s work best. PNG for static screenshots.

**BYO credentials banner:** Record manually during a paused BYO run (no automated capture yet) → save as `09-byo-credentials.png`.
