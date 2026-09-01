import type { BrowserSession } from "@solarisdk/browser";
import type { Desktop } from "@solarisdk/core";
import type { Sandbox } from "@solarisdk/core";
import { llmFallback } from "../llm/fallback";
import {
  booksCsv,
  chartPythonScript,
  journalCsv,
  portalCsv,
  reconcilePythonScript,
  reconcileInvoices,
} from "./reconcile";
import {
  appBaseUrl,
  createBrowserClient,
  createDesktopClient,
  createSandboxClient,
} from "../solari/clients";
import { PORTAL_CREDENTIALS } from "../portal/data";
import { runByoPortalBrowserPhase } from "./byo-browser";
import {
  demoPortalUrls,
  isNightshiftDemoPortal,
} from "./portal";
import {
  cleanupStaleSolariSessions,
  isConcurrencyLimitError,
  releaseSolariResources,
} from "../solari/cleanup";
import { getRun, getPortalProfile, saveRun } from "../store";
import type { NightshiftRun, RunEvent } from "../types";

type Emit = (event: RunEvent) => Promise<void>;

async function updateStep(
  runId: string,
  stepId: string,
  status: NightshiftRun["steps"][0]["status"],
  detail?: string,
) {
  const run = await getRun(runId);
  if (!run) return;
  run.steps = run.steps.map((s) =>
    s.id === stepId
      ? {
          ...s,
          status,
          detail,
          finishedAt:
            status === "done" || status === "error"
              ? new Date().toISOString()
              : s.finishedAt,
          startedAt:
            status === "running" && !s.startedAt
              ? new Date().toISOString()
              : s.startedAt,
        }
      : s,
  );
  await saveRun(run);
}

async function log(emit: Emit, message: string, data?: Record<string, unknown>) {
  await emit({
    at: new Date().toISOString(),
    kind: "log",
    message,
    data,
  });
}

async function safeClick(
  page: Awaited<ReturnType<BrowserSession["newPage"]>>,
  selector: string,
  goal: string,
) {
  try {
    await page.locator(selector).click({ timeout: 8000 });
    return true;
  } catch {
    const screenshot = await page.screenshot({ type: "jpeg", quality: 60 });
    const action = await llmFallback({
      screenshotBase64: screenshot.toString("base64"),
      pageText: await page.locator("body").innerText().catch(() => ""),
      goal,
      failedSelector: selector,
    });
    if (!action) return false;
    if (action.action === "click" && action.selector) {
      await page.locator(action.selector).click({ timeout: 8000 });
      return true;
    }
    if (action.action === "navigate" && action.url) {
      await page.goto(action.url);
      return true;
    }
    return false;
  }
}

export async function executeDemoClose(runId: string, emit: Emit) {
  const run = await getRun(runId);
  if (!run) {
    throw new Error(`Run ${runId} not found — storage read failed`);
  }

  run.status = "running";
  await saveRun(run);

  const base = appBaseUrl();
  const demoUrls = demoPortalUrls(base);
  const useByoPortal = run.mode === "byo" && Boolean(run.portalUrl?.trim());
  const useDemoPortalFlow =
    run.mode === "demo" ||
    (useByoPortal && isNightshiftDemoPortal(run.portalUrl!, base));

  const portalLogin = useByoPortal
    ? run.portalUrl!.includes("/portal/")
      ? demoUrls.login
      : run.portalUrl!
    : demoUrls.login;
  const portalDashboard = useDemoPortalFlow
    ? demoUrls.dashboard
    : run.portalUrl ?? demoUrls.dashboard;

  await cleanupStaleSolariSessions();

  let hadStoredProfile = false;
  if (useByoPortal && run.portalUrl && !run.profileId) {
    const hostname = new URL(run.portalUrl).hostname;
    const storedProfileId = await getPortalProfile(hostname);
    if (storedProfileId) {
      run.profileId = storedProfileId;
      hadStoredProfile = true;
      const withProfile = await getRun(runId);
      if (withProfile) {
        withProfile.profileId = storedProfileId;
        await saveRun(withProfile);
      }
      await log(emit, `Reusing saved Solari profile for ${hostname}.`);
    }
  } else if (run.profileId) {
    hadStoredProfile = true;
  }

  let browserClient: ReturnType<typeof createBrowserClient> | null =
    createBrowserClient();
  const sandboxClient = createSandboxClient();
  const desktopClient = createDesktopClient();
  let browser: BrowserSession | null = null;
  let sandbox: Sandbox | null = null;
  let desktop: Desktop | null = null;
  let browserSessionId: string | undefined;
  let sandboxSessionId: string | undefined;
  let desktopSessionId: string | undefined;

  try {
    // --- Browser phase ---
    await updateStep(runId, "browser-launch", "running");
    await log(emit, "Launching Solari stealth browser with recording…");

    const launched = await browserClient.launch({
      stealth: true,
      recording: true,
      captcha: true,
      ...(run.profileId ? { profileId: run.profileId } : {}),
    });
    browser = launched;
    browserSessionId = launched.id;

    const current = await getRun(runId);
    if (current) {
      current.solari = {
        ...current.solari,
        browserSessionId: launched.id,
      };
      await saveRun(current);
    }

    await updateStep(runId, "browser-launch", "done");

    const page = await launched.newPage();
    await page.setExtraHTTPHeaders({
      "ngrok-skip-browser-warning": "69420",
    });

    if (useDemoPortalFlow) {
      await updateStep(runId, "browser-login", "running");

      await page.goto(portalLogin, {
        waitUntil: "load",
        timeout: 90000,
      });
      await page.fill('input[name="username"]', PORTAL_CREDENTIALS.username);
      await page.fill('input[name="password"]', PORTAL_CREDENTIALS.password);

      const loginRes = await page.context().request.post(`${base}/api/portal/login`, {
        form: {
          username: PORTAL_CREDENTIALS.username,
          password: PORTAL_CREDENTIALS.password,
        },
        maxRedirects: 0,
      });
      if (loginRes.status() >= 400) {
        throw new Error(`Portal login failed (${loginRes.status()})`);
      }

      await page.goto(portalDashboard, {
        waitUntil: "load",
        timeout: 90000,
      });

      const loginShot = await page.screenshot({ type: "jpeg", quality: 70 });
      const loginRun = await getRun(runId);
      if (loginRun) {
        loginRun.live = {
          phase: "browser",
          screenshot: loginShot.toString("base64"),
        };
        await saveRun(loginRun);
        await emit({
          at: new Date().toISOString(),
          kind: "screenshot",
          message: useByoPortal
            ? "Signed in to your VendorNet portal"
            : "Signed in to vendor portal",
          data: { phase: "browser" },
        });
      }

      await updateStep(runId, "browser-login", "done");
      await updateStep(runId, "browser-collect", "running");
      await log(emit, "Collecting pending invoices from nested portal tables…");

      const invoiceIds = await page.locator("tr[data-invoice-id]").evaluateAll(
        (els) => els.map((el) => el.getAttribute("data-invoice-id")).filter(Boolean),
      );

      const confirmations: string[] = [];
      const clickTimeout = 5000;
      for (const id of invoiceIds.slice(0, 12)) {
        const row = page.locator(`tr[data-invoice-id="${id}"]`);
        const receiveBtn = row.locator('button[data-action="receive"]');
        if (await receiveBtn.count()) {
          try {
            await receiveBtn.click({ timeout: clickTimeout });
            const conf = await row
              .locator("[data-confirmation]")
              .innerText({ timeout: clickTimeout })
              .catch(() => "");
            if (conf) confirmations.push(conf.trim());
            await log(emit, `Marked received: ${id}`);
          } catch {
            await log(emit, `Skipped slow row ${id} — using portal export.`);
          }
        }
      }

      await log(emit, `Collected ${confirmations.length} confirmations, exporting CSV.`);

      const csv = portalCsv();
      const collectRun = await getRun(runId);
      if (collectRun) {
        collectRun.artifacts.push({
          name: "portal-invoices.csv",
          type: "csv",
          content: csv,
        });
        collectRun.artifacts.push({
          name: "confirmations.json",
          type: "json",
          content: JSON.stringify(confirmations, null, 2),
        });
        await saveRun(collectRun);
      }

      await updateStep(runId, "browser-collect", "done", `${invoiceIds.length} invoices`);
    } else {
      await runByoPortalBrowserPhase({
        runId,
        page,
        portalUrl: run.portalUrl!,
        browserClient,
        hadStoredProfile,
        emit,
        log: (message) => log(emit, message),
        updateStep: (stepId, status, detail) =>
          updateStep(runId, stepId, status, detail),
      });
    }

    const launchedBrowser = browser;
    await browser.close();
    browser = null;
    await browserClient.close();

    let replayUrl: string | undefined;
    const replayClient = createBrowserClient();
    for (let i = 0; i < 10; i++) {
      try {
        const replay = await replayClient.sessions.getReplayUrl(launchedBrowser.id);
        replayUrl = replay.url;
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    await replayClient.close();
    browserClient = null;

    const afterBrowser = await getRun(runId);
    if (afterBrowser) {
      afterBrowser.solari = {
        ...afterBrowser.solari,
        browserReplayUrl: replayUrl,
      };
      await saveRun(afterBrowser);
    }

    const csvRun = await getRun(runId);
    const csv =
      csvRun?.artifacts.find((a) => a.name === "portal-invoices.csv")?.content ??
      portalCsv();

    // --- Sandbox phase ---
    await updateStep(runId, "sandbox-create", "running");
    await log(emit, "Creating Solari sandbox for reconciliation…");

    sandbox = await sandboxClient.create({
      template: "base",
      cpu: 2,
      memMb: 4096,
      timeoutMs: 15 * 60_000,
      lifecycle: { onTimeout: "pause" },
    });
    sandboxSessionId = sandbox.sandboxId;
    await sandbox.connect();

    const sbRun = await getRun(runId);
    if (sbRun) {
      sbRun.solari = { ...sbRun.solari, sandboxSessionId: sandbox.sandboxId };
      sbRun.live = { phase: "sandbox" };
      await saveRun(sbRun);
    }
    await updateStep(runId, "sandbox-create", "done");

    await updateStep(runId, "sandbox-parse", "running");
    await sandbox.files.write("/tmp/portal.csv", csv);
    await sandbox.files.write("/tmp/books.csv", booksCsv());

    const reconcileOut = await sandbox.runCode(reconcilePythonScript(), {
      language: "python",
    });
    const reconcileText =
      reconcileOut.results
        ?.map((r) => ("text" in r ? r.text : "") ?? "")
        .join("")
        .trim() || JSON.stringify({ rows: reconcileInvoices() });
    await sandbox.files.write("/tmp/reconcile.json", reconcileText);

    const rows = reconcileInvoices();
    const parseRun = await getRun(runId);
    if (parseRun) {
      parseRun.reconcile = rows;
      parseRun.artifacts.push({
        name: "reconcile.json",
        type: "json",
        content: JSON.stringify({ rows }, null, 2),
      });
      parseRun.artifacts.push({
        name: "journal.csv",
        type: "csv",
        content: journalCsv(rows),
      });
      await saveRun(parseRun);
    }
    await updateStep(runId, "sandbox-parse", "done");

    await updateStep(runId, "sandbox-chart", "running");
    const chartOut = await sandbox.runCode(chartPythonScript(), {
      language: "python",
    });
    const chartPng = chartOut.results?.find((r) => r.png)?.png;
    if (chartPng) {
      const chartRun = await getRun(runId);
      if (chartRun) {
        chartRun.artifacts.push({
          name: "exceptions.png",
          type: "png",
          content: chartPng,
        });
        await saveRun(chartRun);
      }
    }
    await sandbox.pause();
    await updateStep(runId, "sandbox-chart", "done");

    // --- Desktop phase ---
    await updateStep(runId, "desktop-create", "running");
    await log(emit, "Starting Solari desktop for LibreOffice filing…");

    desktop = await desktopClient.create({
      template: "default",
      resolution: "1280x720",
      cpu: 4,
      memMb: 8192,
      timeoutMs: 15 * 60_000,
      lifecycle: { onTimeout: "pause" },
    });
    desktopSessionId = desktop.sessionId;

    const deskRun = await getRun(runId);
    if (deskRun) {
      deskRun.solari = {
        ...deskRun.solari,
        desktopSessionId: desktop.sessionId,
        desktopStreamUrl: desktop.streamUrl,
      };
      deskRun.live = {
        phase: "desktop",
        streamUrl: desktop.streamUrl,
      };
      await saveRun(deskRun);
      await log(
        emit,
        "Desktop stream live — watch the Live Surface pane (VNC over WebSocket).",
      );
    }

    await desktop.connect();
    for (let i = 0; i < 30; i++) {
      const health = await desktop.health();
      if (health.ready) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    await updateStep(runId, "desktop-create", "done");

    await updateStep(runId, "desktop-file", "running");
    await log(emit, "Opening LibreOffice Calc and filing journal…");

    const journal = journalCsv(rows);
    await desktop.fs.write("/tmp/journal.csv", journal);

    const pid = await desktop.open("libreoffice", ["--calc", "/tmp/journal.csv"]);
    await new Promise((r) => setTimeout(r, 6000));

    await desktop.mouse.click(320, 300, { humanize: true });
    await desktop.keyboard.type("Nightshift AP Close — filed automatically");
    await new Promise((r) => setTimeout(r, 1500));

    const deskShot = await desktop.screenshot({ format: "jpeg", quality: 70 });
    const deskShotB64 = Buffer.from(deskShot).toString("base64");
    const fileRun = await getRun(runId);
    if (fileRun) {
      fileRun.live = {
        phase: "desktop",
        streamUrl: fileRun.live?.streamUrl ?? desktop.streamUrl,
        screenshot: deskShotB64,
      };
      fileRun.artifacts.push({
        name: "desktop-screenshot.jpg",
        type: "png",
        content: deskShotB64,
      });
      await saveRun(fileRun);
      await emit({
        at: new Date().toISOString(),
        kind: "screenshot",
        message: "Desktop filing in progress",
        data: { phase: "desktop" },
      });
    }

    await updateStep(runId, "desktop-file", "done", `libreoffice pid ${pid}`);

    await updateStep(runId, "desktop-export", "running");
    await desktop.keyboard.press(["ctrl", "s"]);
    await new Promise((r) => setTimeout(r, 2000));
    await desktop.keyboard.press(["ctrl", "shift", "s"]);
    await new Promise((r) => setTimeout(r, 1500));
    await desktop.keyboard.type("/tmp/ap-close-export.ods");
    await desktop.keyboard.press(["Enter"]);
    await new Promise((r) => setTimeout(r, 2000));

    let exportContent = "";
    try {
      exportContent = await desktop.fs.readText("/tmp/ap-close-export.ods");
    } catch {
      exportContent = journal;
    }

    const exportRun = await getRun(runId);
    if (exportRun) {
      exportRun.artifacts.push({
        name: "ap-close-export.ods",
        type: "xlsx",
        content: Buffer.from(exportContent).toString("base64"),
      });
      await saveRun(exportRun);
    }

    await updateStep(runId, "desktop-export", "done");

    // Keep the VNC stream alive briefly so the operator UI can attach before
    // pause tears down the host slot (stream only works while status=running).
    await log(emit, "Keeping desktop live for 90s so you can watch the stream…");
    await new Promise((r) => setTimeout(r, 90_000));
    await desktop.pause();

    // --- Pack ---
    await updateStep(runId, "pack", "running");
    const finalRun = await getRun(runId);
    if (finalRun) {
      finalRun.status = "completed";
      if (finalRun.mode === "demo") {
        finalRun.isPublic = true;
      }
      finalRun.artifacts.push({
        name: "work-pack",
        type: "url",
        url: `/run/${runId}#work-pack`,
      });
      if (replayUrl) {
        finalRun.artifacts.push({
          name: "browser-replay",
          type: "url",
          url: `/run/${runId}/replay`,
        });
      }
      await saveRun(finalRun);
    }
    await updateStep(runId, "pack", "done");
    await log(emit, "Close complete — work pack published.");
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Unknown error";
    const message = isConcurrencyLimitError(err)
      ? "Too many concurrent Solari sessions. Orphaned sessions were cleared — wait a minute and start a fresh demo."
      : raw;
    const failed = await getRun(runId);
    if (failed) {
      failed.status = "failed";
      failed.error = message;
      await saveRun(failed);
    }
    await emit({
      at: new Date().toISOString(),
      kind: "error",
      message,
    });
    throw err;
  } finally {
    await releaseSolariResources({
      browser,
      browserClient,
      sandbox,
      sandboxClient,
      desktop,
      desktopClient,
      browserSessionId,
      sandboxSessionId,
      desktopSessionId,
    });
  }
}
