/**
 * Record short demo clips for the landing page pillar cards.
 * Usage: npm run dev (separate terminal) && npm run record-clips
 */
import { chromium } from "playwright";
import { mkdir, rename, rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public/demos");
const TMP = path.join(ROOT, "tmp-videos");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const VIEWPORT = { width: 960, height: 540 };

async function recordClip(name, run) {
  await mkdir(TMP, { recursive: true });
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: TMP, size: VIEWPORT },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    await run(page, context);
    await page.waitForTimeout(400);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();

    if (video) {
      const src = await video.path();
      const dest = path.join(OUT, `${name}.webm`);
      await rename(src, dest);
      console.log(`✓ ${dest}`);
    }
  }
}

async function recordBrowser(page) {
  await page.goto(`${BASE}/demo/clips/browser`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const frame = page.frameLocator('iframe[title="Vendor portal session"]');
  await frame.getByRole("button", { name: /mark received/i }).first().waitFor({
    timeout: 15000,
  });

  const markButtons = frame.getByRole("button", { name: /mark received/i });
  const count = await markButtons.count();
  for (let i = 0; i < Math.min(count, 3); i++) {
    await markButtons.nth(i).click();
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(1500);
}

async function recordSandbox(page) {
  await page.goto(`${BASE}/demo/clips/sandbox`, { waitUntil: "networkidle" });
  await page.waitForTimeout(7500);
}

async function recordDesktop(page) {
  await page.goto(`${BASE}/demo/clips/desktop`, { waitUntil: "networkidle" });
  await page.waitForTimeout(6500);
}

async function recordBrowserReplay(page) {
  const runId = process.env.DEMO_RUN_ID ?? "4647eee8";
  await page.goto(`${BASE}/run/${runId}/replay`, { waitUntil: "networkidle" });
  await page.waitForTimeout(9000);
}

async function main() {
  console.log(`Recording clips from ${BASE}…`);
  await rm(TMP, { recursive: true, force: true });

  await recordClip("browser", (page) => recordBrowser(page));
  await recordClip("sandbox", (page) => recordSandbox(page));
  await recordClip("desktop", (page) => recordDesktop(page));

  // Optional: Solari browser session replay (rrweb) for hero or alt browser clip
  if (process.env.RECORD_REPLAY === "1") {
    await recordClip("browser-replay", recordBrowserReplay);
  }

  await rm(TMP, { recursive: true, force: true });
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
