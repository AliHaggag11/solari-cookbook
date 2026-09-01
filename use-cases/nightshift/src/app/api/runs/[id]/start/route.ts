import { NextResponse } from "next/server";
import { isRunEngineActive } from "@/lib/runbook/kickoff";
import { getRun } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const run = await getRun(id);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (run.status !== "queued") {
    return NextResponse.json({ ok: true, status: run.status });
  }
  if (isRunEngineActive(id)) {
    return NextResponse.json({ ok: true, status: "running" });
  }

  return NextResponse.json({
    ok: true,
    status: "queued",
    hint: "Engine starts when the run page opens the live event stream.",
  });
}
