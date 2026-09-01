import { appendAnalytics, getRun, releaseEngineLock, saveRun, tryAcquireEngineLock } from "@/lib/store";
import type { RunEvent } from "@/lib/types";

const activeRuns = new Set<string>();

export function isRunEngineActive(runId: string) {
  return activeRuns.has(runId);
}

export async function runDemoCloseOnInstance(runId: string) {
  if (activeRuns.has(runId)) return;

  const existing = await getRun(runId);
  if (!existing || existing.status === "completed" || existing.status === "failed") {
    return;
  }
  if (existing.status === "running") return;
  if (!(await tryAcquireEngineLock(runId))) return;

  activeRuns.add(runId);

  const emit = async (event: RunEvent) => {
    const current = await getRun(runId);
    if (current) {
      current.events.push(event);
      await saveRun(current);
    }
  };

  try {
    const { executeDemoClose } = await import("@/lib/runbook/engine");
    await executeDemoClose(runId, emit);
    await appendAnalytics({
      at: new Date().toISOString(),
      kind: "demo_finish",
      runId,
    });
  } catch (err) {
    console.error("[nightshift] run failed", runId, err);
    const failed = await getRun(runId);
    if (failed && failed.status !== "completed") {
      failed.status = "failed";
      failed.error = err instanceof Error ? err.message : "Run failed";
      await saveRun(failed);
    }
  } finally {
    activeRuns.delete(runId);
    await releaseEngineLock(runId);
  }
}

/** @deprecated Use runDemoCloseOnInstance inside the SSE handler. */
export function kickoffDemoClose(runId: string) {
  void runDemoCloseOnInstance(runId);
}

export async function ensureCloseStarted(runId: string) {
  const run = await getRun(runId);
  if (!run || (run.mode !== "demo" && run.mode !== "byo")) return;
  if (run.status !== "queued") return;
  await runDemoCloseOnInstance(runId);
}

/** @deprecated Use ensureCloseStarted */
export async function ensureDemoCloseStarted(runId: string) {
  return ensureCloseStarted(runId);
}
