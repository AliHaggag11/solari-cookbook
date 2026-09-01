import { NextResponse } from "next/server";
import { getRun, saveRun } from "@/lib/store";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const run = await getRun(id);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  run.status = "paused";
  run.events.push({
    at: new Date().toISOString(),
    kind: "pause",
    message: "Run paused — take over on live stream, then resume.",
  });
  await saveRun(run);
  return NextResponse.json({ ok: true, status: run.status });
}
