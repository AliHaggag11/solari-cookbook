import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { initialSteps } from "@/lib/runbook/steps";
import { appendAnalytics, assertPersistentStorage, getPortalProfile, saveRun } from "@/lib/store";
import type { NightshiftRun } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    assertPersistentStorage();

    const body = (await req.json().catch(() => ({}))) as {
      mode?: "demo" | "byo";
      portalUrl?: string;
      profileId?: string;
      isPublic?: boolean;
    };

    const id = randomUUID().slice(0, 8);
    const now = new Date().toISOString();
    const mode = body.mode ?? "demo";

    if (mode === "byo") {
      if (!body.portalUrl?.trim()) {
        return NextResponse.json(
          { error: "Portal URL is required for BYO runs." },
          { status: 400 },
        );
      }
      const { validateByoPortalUrl } = await import("@/lib/runbook/portal");
      const validated = validateByoPortalUrl(body.portalUrl);
      if ("error" in validated) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }
      body.portalUrl = validated.url;
    }

    let profileId = body.profileId;
    if (mode === "byo" && body.portalUrl && !profileId) {
      const hostname = new URL(body.portalUrl).hostname;
      profileId = (await getPortalProfile(hostname)) ?? undefined;
    }

    if (mode === "demo") {
      const { appBaseUrl, isLocalPortalUrl } = await import("@/lib/solari/clients");
      const portalBase = appBaseUrl();
      if (isLocalPortalUrl(portalBase)) {
        return NextResponse.json(
          {
            error:
              "Demo close requires a public app URL. Deploy Nightshift or set PORTAL_PUBLIC_URL to an ngrok/Vercel URL — Solari's cloud browser cannot reach localhost.",
          },
          { status: 400 },
        );
      }
    }

    const run: NightshiftRun = {
      id,
      mode,
      title:
        mode === "demo"
          ? "Tonight's AP close"
          : `Portal nightshift · ${new URL(body.portalUrl!).hostname}`,
      status: "queued",
      isPublic: body.isPublic ?? mode === "demo",
      createdAt: now,
      updatedAt: now,
      portalUrl: body.portalUrl,
      profileId,
      steps: initialSteps(),
      events: [],
      artifacts: [],
    };

    await saveRun(run);
    await appendAnalytics({
      at: now,
      kind: "demo_start",
      runId: id,
      meta: { mode },
    });

    return NextResponse.json({ id, status: run.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start run";
    console.error("[nightshift] POST /api/runs failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const { listPublicRuns } = await import("@/lib/store");
  const runs = await listPublicRuns();
  return NextResponse.json({ runs });
}
