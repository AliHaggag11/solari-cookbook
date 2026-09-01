import type { NightshiftRun } from "../types";

/** True when the operator should enter portal username/password. */
export function runNeedsPortalCredentials(run: NightshiftRun): boolean {
  if (run.mode !== "byo") return false;

  const loginStep = run.steps.find((step) => step.id === "browser-login");
  if (loginStep?.status === "done") return false;

  if (
    loginStep?.status === "running" &&
    loginStep.detail?.toLowerCase().includes("signing in")
  ) {
    return false;
  }

  if (run.awaitingPortalLogin) return true;

  if (
    run.status === "paused" &&
    loginStep?.status === "paused" &&
    loginStep.detail?.toLowerCase().includes("waiting for credentials")
  ) {
    return true;
  }

  return false;
}

export function portalCredentialHost(run: NightshiftRun): string {
  if (run.portalLoginHost) return run.portalLoginHost;
  if (run.portalUrl) {
    try {
      return new URL(run.portalUrl).hostname;
    } catch {
      /* fall through */
    }
  }
  return "your portal";
}
