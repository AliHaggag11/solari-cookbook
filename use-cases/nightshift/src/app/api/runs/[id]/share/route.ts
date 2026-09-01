import { NextResponse } from "next/server";
import { appendAnalytics, getRun } from "@/lib/store";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const run = await getRun(id);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await appendAnalytics({
    at: new Date().toISOString(),
    kind: "share_open",
    runId: id,
  });

  return NextResponse.json({ ok: true });
}
