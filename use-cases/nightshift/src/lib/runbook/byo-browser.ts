import type { Solari } from "@solarisdk/browser";
import type { BrowserSession } from "@solarisdk/browser";
import { runLlmGoal } from "../llm/actions";
import { portalCsv } from "./reconcile";
import { getRun, saveRun } from "../store";
import {
  isLoginScreen,
  pauseForPortalLogin,
  performPortalLogin,
  persistPortalProfile,
  portalHostname,
  pushLiveBrowserScreenshot,
  waitForPortalCredentials,
} from "./portal-login";

type Page = Awaited<ReturnType<BrowserSession["newPage"]>>;

export type BrowserPhaseEmit = (event: {
  at: string;
  kind: "log" | "screenshot" | "pause";
  message: string;
  data?: Record<string, unknown>;
}) => Promise<void>;

export async function runByoPortalBrowserPhase(opts: {
  runId: string;
  page: Page;
  portalUrl: string;
  browserClient: Solari;
  hadStoredProfile: boolean;
  emit: BrowserPhaseEmit;
  log: (message: string) => Promise<void>;
  updateStep: (
    stepId: string,
    status: "running" | "done" | "error" | "paused",
    detail?: string,
  ) => Promise<void>;
}) {
  const {
    runId,
    page,
    portalUrl,
    browserClient,
    hadStoredProfile,
    emit,
    log,
    updateStep,
  } = opts;

  const hostname = portalHostname(portalUrl);

  await updateStep("browser-login", "running");
  await log(`Opening your portal at ${portalUrl}`);

  await page.goto(portalUrl, { waitUntil: "load", timeout: 90_000 });

  const shot = await page.screenshot({ type: "jpeg", quality: 70 });
  const loginRun = await getRun(runId);
  if (loginRun) {
    loginRun.live = { phase: "browser", screenshot: shot.toString("base64") };
    await saveRun(loginRun);
    await emit({
      at: new Date().toISOString(),
      kind: "screenshot",
      message: "Loaded your portal",
      data: { phase: "browser", portalUrl },
    });
  }

  let signedInWithProfile = false;

  if (await isLoginScreen(page)) {
    if (hadStoredProfile) {
      await log(
        `Saved Solari profile for ${hostname} did not bypass sign-in — need fresh credentials.`,
      );
    }

    let signedIn = false;
    for (let loginAttempt = 0; loginAttempt < 3 && !signedIn; loginAttempt += 1) {
      if (loginAttempt > 0) {
        await page.goto(portalUrl, { waitUntil: "load", timeout: 90_000 });
      }

      await updateStep("browser-login", "paused", "Waiting for credentials");
      await pauseForPortalLogin({ runId, portalUrl, emit, log });

      const creds = await waitForPortalCredentials(runId);
      await updateStep("browser-login", "running", "Signing in");
      await log("Credentials received — signing in to your portal…");

      await performPortalLogin(page, creds.username, creds.password);
      await pushLiveBrowserScreenshot(runId, page, emit);
      await log("Submitted sign-in form — waiting for portal to respond…");

      for (let attempt = 0; attempt < 15; attempt += 1) {
        if (!(await isLoginScreen(page))) break;
        await page.waitForTimeout(2000);
        if (attempt % 2 === 1) {
          await pushLiveBrowserScreenshot(runId, page, emit);
        }
      }

      if (await isLoginScreen(page)) {
        await log("Sign-in did not complete — check credentials and try again.");
        continue;
      }

      signedIn = true;
      const profileId = await persistPortalProfile(browserClient, page, hostname);
      const afterLogin = await getRun(runId);
      if (afterLogin) {
        afterLogin.profileId = profileId;
        afterLogin.events.push({
          at: new Date().toISOString(),
          kind: "log",
          message: `Saved Solari browser profile for ${hostname} — future runs will reuse this session.`,
        });
        await saveRun(afterLogin);
      }
      await log(`Solari profile saved for ${hostname}.`);
    }

    if (!(await isLoginScreen(page))) {
      /* signed in */
    } else {
      throw new Error(
        "Portal sign-in failed after multiple attempts. Check username/password and try a new run.",
      );
    }
  } else if (hadStoredProfile) {
    signedInWithProfile = true;
    await log(`Signed in via saved Solari profile for ${hostname}.`);
  } else {
    await runLlmGoal(
      page,
      "If a login form is visible, complete sign-in using any credentials shown on the page. Otherwise confirm the portal dashboard is visible.",
      3,
    );
  }

  const loginShot = await page.screenshot({ type: "jpeg", quality: 70 });
  const signedInRun = await getRun(runId);
  if (signedInRun) {
    signedInRun.live = {
      phase: "browser",
      screenshot: loginShot.toString("base64"),
    };
    await saveRun(signedInRun);
    await emit({
      at: new Date().toISOString(),
      kind: "screenshot",
      message: signedInWithProfile ? "Signed in via saved profile" : "Signed in to your portal",
      data: { phase: "browser" },
    });
  }

  await updateStep(
    "browser-login",
    "done",
    signedInWithProfile ? "Saved profile" : "Portal loaded",
  );

  await updateStep("browser-collect", "running");
  await log("Searching your portal for invoice export or AP queue actions…");

  await runLlmGoal(
    page,
    "Navigate to accounts payable, invoices, vendor bills, or a payment queue if not already there.",
    3,
  );
  await runLlmGoal(
    page,
    "Click Export, Download CSV, Download invoices, or any bulk export control if visible.",
    3,
  );

  let downloadedCsv: string | undefined;
  try {
    const downloadPromise = page.waitForEvent("download", { timeout: 8000 });
    await runLlmGoal(
      page,
      "Click the most likely CSV or Excel export button for invoices.",
      2,
    );
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    if (stream) {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      downloadedCsv = Buffer.concat(chunks).toString("utf8");
      await log(`Downloaded ${download.suggestedFilename() ?? "export"} from your portal.`);
    }
  } catch {
    await log("No CSV download detected — using Nightshift seed data for reconciliation.");
  }

  const pageText = await page.locator("body").innerText().catch(() => "");
  const csv = downloadedCsv && downloadedCsv.includes(",") ? downloadedCsv : portalCsv();

  const collectRun = await getRun(runId);
  if (collectRun) {
    collectRun.artifacts.push(
      { name: "portal-invoices.csv", type: "csv", content: csv },
      {
        name: "portal-page.txt",
        type: "json",
        content: JSON.stringify({ url: portalUrl, excerpt: pageText.slice(0, 8000) }, null, 2),
      },
    );
    await saveRun(collectRun);
  }

  await updateStep(
    "browser-collect",
    "done",
    downloadedCsv ? "Exported from your portal" : "Seed CSV fallback",
  );
}
