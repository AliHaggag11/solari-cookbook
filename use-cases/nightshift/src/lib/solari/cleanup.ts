import type { BrowserSession } from "@solarisdk/browser";
import type { Desktop } from "@solarisdk/core";
import type { Sandbox } from "@solarisdk/core";
import {
  createBrowserClient,
  createDesktopClient,
  createSandboxClient,
} from "./clients";

export function isConcurrencyLimitError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return (
    /too many concurrent sessions/i.test(message) ||
    /ConcurrencyLimitExceeded/i.test(message)
  );
}

/** Release orphaned sandboxes/desktops left by failed or abandoned runs. */
export async function cleanupStaleSolariSessions() {
  const sandboxClient = createSandboxClient();

  try {
    for await (const sb of sandboxClient.listAll({ state: "running", kind: "sandbox" })) {
      await sandboxClient.kill(sb.sandboxId).catch(() => {});
    }
  } catch {
    /* listing may fail if the key lacks permission */
  }

  try {
    for await (const sb of sandboxClient.listAll({ state: "running", kind: "desktop" })) {
      await sandboxClient.kill(sb.sandboxId).catch(() => {});
    }
  } catch {
    /* ignore */
  }

  try {
    for await (const sb of sandboxClient.listAll({ state: "paused" })) {
      await sandboxClient.kill(sb.sandboxId).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

type SessionHandles = {
  browser?: BrowserSession | null;
  browserClient?: ReturnType<typeof createBrowserClient> | null;
  sandbox?: Sandbox | null;
  sandboxClient?: ReturnType<typeof createSandboxClient> | null;
  desktop?: Desktop | null;
  desktopClient?: ReturnType<typeof createDesktopClient> | null;
  browserSessionId?: string;
  sandboxSessionId?: string;
  desktopSessionId?: string;
};

export async function releaseSolariResources(handles: SessionHandles) {
  if (handles.browser) {
    await handles.browser.close().catch(() => {});
  } else if (handles.browserSessionId) {
    const client = createBrowserClient();
    try {
      await client.sessions.releaseAndWait(handles.browserSessionId);
    } catch {
      client.sessions.release(handles.browserSessionId);
    } finally {
      await client.close().catch(() => {});
    }
  }

  if (handles.browserClient) {
    await handles.browserClient.close().catch(() => {});
  }

  if (handles.sandbox) {
    await handles.sandbox.pause().catch(async () => {
      if (handles.sandboxSessionId && handles.sandboxClient) {
        await handles.sandboxClient.kill(handles.sandboxSessionId).catch(() => {});
      }
    });
  } else if (handles.sandboxSessionId && handles.sandboxClient) {
    await handles.sandboxClient.kill(handles.sandboxSessionId).catch(() => {});
  }

  if (handles.desktop) {
    await handles.desktop.pause().catch(async () => {
      if (handles.desktopSessionId && handles.desktopClient) {
        await handles.desktopClient.destroy(handles.desktopSessionId).catch(() => {});
      }
    });
  } else if (handles.desktopSessionId && handles.desktopClient) {
    await handles.desktopClient.destroy(handles.desktopSessionId).catch(() => {});
  }
}
