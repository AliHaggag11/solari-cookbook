import { NextResponse } from "next/server";
import { getRun, saveRun } from "@/lib/store";
import { runNeedsPortalCredentials } from "@/lib/runbook/portal-credentials";
import { portalHostname } from "@/lib/runbook/portal-login";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const run = await getRun(id);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!runNeedsPortalCredentials(run)) {
    return NextResponse.json(
      { error: "This run is not waiting for portal credentials." },
      { status: 400 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };

  const username = body.username?.trim();
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  run.portalLoginCreds = { username, password };
  run.awaitingPortalLogin = false;
  run.status = "running";
  if (!run.portalLoginHost && run.portalUrl) {
    run.portalLoginHost = portalHostname(run.portalUrl);
  }
  run.events.push({
    at: new Date().toISOString(),
    kind: "log",
    message: "Portal credentials submitted — resuming sign-in.",
  });
  await saveRun(run);

  return NextResponse.json({ ok: true });
}
