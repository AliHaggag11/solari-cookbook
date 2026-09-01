/**
 * Record screenshots + short clips for X / LinkedIn posts.
 *
 * Usage:
 *   npm run record-social
 *   BASE_URL=https://nightshift-ecru.vercel.app npm run record-social
 *
 * Optional GIF conversion (requires ffmpeg):
 *   CONVERT_GIF=1 npm run record-social
 */
import { chromium } from "playwright";
import { mkdir, rename, rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public/social");
const TMP = path.join(ROOT, "tmp-social");
const BASE = process.env.BASE_URL ?? "https://nightshift-ecru.vercel.app";

const VIEWPORT = { width: 1280, height: 720 };

async function ensureOut() {
  await mkdir(OUT, { recursive: true });
  await mkdir(TMP, { recursive: true });
}

async function screenshot(page, name) {
  const dest = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: dest, type: "png" });
  console.log(`✓ ${dest}`);
}

async function recordClip(name, run) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: TMP, size: VIEWPORT },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    await run(page);
    await page.waitForTimeout(500);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();

    if (video) {
      const src = await video.path();
      const dest = path.join(OUT, `${name}.webm`);
      await rename(src, dest);
      console.log(`✓ ${dest}`);

      if (process.env.CONVERT_GIF === "1") {
        try {
          const gifDest = path.join(OUT, `${name}.gif`);
          execSync(
            `ffmpeg -y -i "${dest}" -vf "fps=12,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "${gifDest}"`,
            { stdio: "ignore" },
          );
          console.log(`✓ ${gifDest}`);
        } catch {
          console.warn(`  (skip gif — ffmpeg not available for ${name})`);
        }
      }
    }
  }
}

async function fetchCompletedRunId() {
  try {
    const res = await fetch(`${BASE}/api/gallery`);
    const data = await res.json();
    return data.runs?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function captureHome(browser) {
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1500);
  await screenshot(page, "01-home-hero");
  await page.close();
}

async function captureDemoClips() {
  await recordClip("02-browser-phase", async (page) => {
    await page.goto(`${BASE}/demo/clips/browser`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const frame = page.frameLocator('iframe[title="Vendor portal session"]');
    await frame.getByRole("button", { name: /mark received/i }).first().waitFor({ timeout: 20_000 });
    const buttons = frame.getByRole("button", { name: /mark received/i });
    for (let i = 0; i < Math.min(await buttons.count(), 3); i++) {
      await buttons.nth(i).click();
      await page.waitForTimeout(600);
    }
    await page.waitForTimeout(1200);
  });

  await recordClip("03-sandbox-phase", async (page) => {
    await page.goto(`${BASE}/demo/clips/sandbox`, { waitUntil: "networkidle" });
    await page.waitForTimeout(6500);
  });

  await recordClip("04-desktop-phase", async (page) => {
    await page.goto(`${BASE}/demo/clips/desktop`, { waitUntil: "networkidle" });
    await page.waitForTimeout(6500);
  });
}

async function captureOperator(browser, runId) {
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/run/${runId}`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2000);
  await screenshot(page, "05-operator-three-pane");

  const workPack = page.locator("#work-pack");
  if (await workPack.count()) {
    await workPack.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const dest = path.join(OUT, "06-reconcile-mismatches.png");
    await workPack.screenshot({ path: dest, type: "png" });
    console.log(`✓ ${dest}`);
  }

  await page.close();
}

async function captureWorkflowMontage(browser) {
  await recordClip("07-workflow-montage", async (page) => {
    await page.goto(`${BASE}/demo/clips/browser`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await page.goto(`${BASE}/demo/clips/sandbox`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await page.goto(`${BASE}/demo/clips/desktop`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
  });
}

async function captureReplay(browser, runId) {
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/run/${runId}/replay`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2000);
  await screenshot(page, "08-browser-replay");

  await recordClip("08-browser-replay", async (p) => {
    await p.goto(`${BASE}/run/${runId}/replay`, { waitUntil: "networkidle", timeout: 60_000 });
    await p.waitForTimeout(8000);
  });

  await page.close();
}

async function main() {
  console.log(`Recording social snippets from ${BASE}…`);
  await rm(TMP, { recursive: true, force: true });
  await ensureOut();

  const runId = process.env.DEMO_RUN_ID ?? (await fetchCompletedRunId());
  if (!runId) {
    console.warn("No completed run in gallery — operator/replay snippets skipped.");
    console.warn("Run a demo close on production first, or set DEMO_RUN_ID=…");
  } else {
    console.log(`Using run ${runId} for operator + replay captures.`);
  }

  const browser = await chromium.launch();

  await captureHome(browser);

  if (runId) {
    await captureOperator(browser, runId);
    await captureReplay(browser, runId);
  }

  await browser.close();

  await captureDemoClips();
  await captureWorkflowMontage();

  await rm(TMP, { recursive: true, force: true });
  console.log("\nDone → public/social/");
  console.log("Tip: CONVERT_GIF=1 npm run record-social  (needs ffmpeg)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
