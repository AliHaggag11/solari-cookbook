import type { Solari } from "@solarisdk/browser";
import type { BrowserSession } from "@solarisdk/browser";
import { getRun, saveRun } from "../store";

type Page = Awaited<ReturnType<BrowserSession["newPage"]>>;

const CREDENTIAL_POLL_MS = 1500;
const CREDENTIAL_TIMEOUT_MS = 4 * 60 * 1000;

export async function isLoginScreen(page: Page): Promise<boolean> {
  const password = page.locator('input[type="password"]');
  if ((await password.count()) === 0) return false;
  return password.first().isVisible().catch(() => false);
}

function loginForm(page: Page) {
  return page.locator("form").filter({ has: page.locator('input[type="password"]') }).first();
}

export async function performPortalLogin(
  page: Page,
  username: string,
  password: string,
): Promise<void> {
  const form = loginForm(page);
  const hasForm = (await form.count()) > 0;

  const userField = hasForm
    ? form
        .locator(
          [
            'input[type="email"]',
            'input[name="email"]',
            'input[autocomplete="username"]',
            'input[name*="user" i]',
            'input[name*="email" i]',
            'input[id*="email" i]',
            'input[type="text"]',
          ].join(", "),
        )
        .first()
    : page
        .locator(
          'input[type="email"], input[name="email"], input[autocomplete="username"], input[type="text"]',
        )
        .first();

  const passField = hasForm
    ? form.locator('input[type="password"]').first()
    : page.locator('input[type="password"]').first();

  await userField.waitFor({ state: "visible", timeout: 15_000 });
  await userField.click();
  await userField.fill("");
  await userField.fill(username);
  await passField.click();
  await passField.fill("");
  await passField.fill(password);

  const submit = hasForm
    ? form.locator(
        [
          'input[type="submit"]',
          'button[type="submit"]',
          'input[name="jaduSignInButton"]',
          'button:has-text("Sign in")',
          'button:has-text("Sign-in")',
          'button:has-text("Log in")',
        ].join(", "),
      ).first()
    : page.locator(
        'input[type="submit"], button[type="submit"], input[name="jaduSignInButton"]',
      ).first();

  const signInUrl = page.url();

  if (await submit.count()) {
    await Promise.all([
      page
        .waitForURL((url) => url.href !== signInUrl, { timeout: 45_000 })
        .catch(() => page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {})),
      submit.click(),
    ]);
  } else if (hasForm) {
    await Promise.all([
      page
        .waitForURL((url) => url.href !== signInUrl, { timeout: 45_000 })
        .catch(() => page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {})),
      form.evaluate((el) => {
        (el as HTMLFormElement).requestSubmit();
      }),
    ]);
  } else {
    await passField.press("Enter");
    await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {});
  }

  await page.waitForTimeout(1500);
}

export async function waitForPortalCredentials(runId: string): Promise<{
  username: string;
  password: string;
}> {
  const started = Date.now();

  while (Date.now() - started < CREDENTIAL_TIMEOUT_MS) {
    const run = await getRun(runId);
    if (!run) throw new Error("Run not found while waiting for portal login");

    if (run.portalLoginCreds?.username && run.portalLoginCreds?.password) {
      const creds = {
        username: run.portalLoginCreds.username,
        password: run.portalLoginCreds.password,
      };
      run.portalLoginCreds = undefined;
      run.awaitingPortalLogin = false;
      run.status = "running";
      await saveRun(run);
      return creds;
    }

    if (run.status === "failed") {
      throw new Error(run.error ?? "Run failed while waiting for portal login");
    }

    await new Promise((r) => setTimeout(r, CREDENTIAL_POLL_MS));
  }

  throw new Error(
    "Timed out waiting for portal credentials. Start a new run and sign in when prompted.",
  );
}

export async function pauseForPortalLogin(opts: {
  runId: string;
  portalUrl: string;
  emit: (event: {
    at: string;
    kind: "pause" | "log";
    message: string;
    data?: Record<string, unknown>;
  }) => Promise<void>;
  log: (message: string) => Promise<void>;
}) {
  const { runId, portalUrl, emit, log } = opts;
  const hostname = new URL(portalUrl).hostname;

  const run = await getRun(runId);
  if (!run) throw new Error("Run not found");

  run.status = "paused";
  run.awaitingPortalLogin = true;
  run.portalLoginHost = hostname;
  run.events.push({
    at: new Date().toISOString(),
    kind: "pause",
    message: `Sign-in required for ${hostname}. Enter your portal credentials to continue.`,
    data: { portalUrl, hostname },
  });
  await saveRun(run);

  await emit({
    at: new Date().toISOString(),
    kind: "pause",
    message: `Sign-in required for ${hostname}`,
    data: { portalUrl, hostname },
  });
  await log(
    `Portal sign-in screen detected. Waiting for your credentials (saved Solari profile will be used on future runs).`,
  );
}

export async function persistPortalProfile(
  browserClient: Solari,
  page: Page,
  hostname: string,
): Promise<string> {
  const storageState = await page.context().storageState();
  const profileName = `nightshift-${hostname}`;
  const existing = await browserClient.profiles.list();
  let profile = existing.find((entry) => entry.name === profileName);

  if (!profile) {
    profile = await browserClient.profiles.create({ name: profileName });
  }

  await browserClient.profiles.save(profile.id, storageState);

  const { savePortalProfile } = await import("../store");
  await savePortalProfile(hostname, profile.id);

  return profile.id;
}

export function portalHostname(portalUrl: string): string {
  return new URL(portalUrl).hostname;
}

export async function pushLiveBrowserScreenshot(
  runId: string,
  page: Page,
  emit?: (event: {
    at: string;
    kind: "screenshot";
    message: string;
    data?: Record<string, unknown>;
  }) => Promise<void>,
) {
  const shot = await page.screenshot({ type: "jpeg", quality: 70 });
  const run = await getRun(runId);
  if (!run) return;
  run.live = { phase: "browser", screenshot: shot.toString("base64") };
  await saveRun(run);
  if (emit) {
    await emit({
      at: new Date().toISOString(),
      kind: "screenshot",
      message: "Browser updated",
      data: { phase: "browser" },
    });
  }
}
