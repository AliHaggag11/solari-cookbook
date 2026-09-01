import { gunzipSync } from "zlib";
import { NextResponse } from "next/server";
import { getRun } from "@/lib/store";
import { createBrowserClient } from "@/lib/solari/clients";

function decodeReplay(bytes: Uint8Array): string {
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    return gunzipSync(bytes).toString("utf-8");
  }
  return new TextDecoder().decode(bytes);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const run = await getRun(id);
  const sessionId = run?.solari?.browserSessionId;

  if (!run || !sessionId) {
    return NextResponse.json({ error: "Replay not found" }, { status: 404 });
  }

  const client = createBrowserClient();
  try {
    const bytes = await client.sessions.downloadReplay(sessionId);
    const text = decodeReplay(bytes);
    const events = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as unknown);

    return NextResponse.json({
      events,
      sessionId,
      eventCount: events.length,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load browser replay";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    await client.close();
  }
}
